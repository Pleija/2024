import { EntityEntry } from "../Data/EntityEntry";
import { EntityState } from "../Data/EntityState";
import { DBEventEmitter } from "../Data/Event/DbEventEmitter";
import { hashCode, isValueType } from "../Helper/Util";
import { RelationDataMetaData } from "../MetaData/Relation/RelationDataMetaData";
import { EntityExpression } from "../Queryable/QueryExpression/EntityExpression";
import { GroupByExpression } from "../Queryable/QueryExpression/GroupByExpression";
import { GroupedExpression } from "../Queryable/QueryExpression/GroupedExpression";
export class POJOQueryResultParser {
    constructor() {
        this._cache = new Map();
    }
    get orderedSelects() {
        if (!this._orderedSelects) {
            this._orderedSelects = [this.queryExpression];
            for (let i = 0; i < this._orderedSelects.length; i++) {
                const select = this._orderedSelects[i];
                const addition = select.resolvedIncludes.select((o) => o.child).toArray();
                this._orderedSelects.splice(i + 1, 0, ...addition);
            }
        }
        return this._orderedSelects;
    }
    parse(queryResults, dbContext) {
        return this.parseData(queryResults, dbContext);
    }
    getColumnValue(column, data, dbContext) {
        const columnMeta = column.columnMeta ? column.columnMeta : { type: column.type, nullable: column.isNullable };
        return this.queryBuilder.toPropertyValue(data[column.dataPropertyName], columnMeta);
    }
    getResolveData(select, dbContext) {
        let resolveCache = this._cache.get(select);
        if (!resolveCache) {
            resolveCache = {
                isValueType: isValueType(select.itemType),
                dbSet: dbContext.set(select.itemType)
            };
            if (resolveCache.isValueType) {
                resolveCache.column = select.selects.first();
            }
            else {
                let primaryColumns = select.entity.primaryColumns.where((o) => o.columnName !== "__index");
                resolveCache.primaryColumns = primaryColumns;
                resolveCache.columns = select.selects;
                if (resolveCache.dbSet) {
                    resolveCache.primaryColumns = primaryColumns = primaryColumns.union(select.resolvedSelects.where((o) => resolveCache.dbSet.primaryKeys.any((c) => c.propertyName === o.propertyName)));
                    primaryColumns.enableCache = true;
                    const columns = select.selects.union(select.relationColumns);
                    columns.enableCache = true;
                    resolveCache.columns = columns;
                }
                if (select.entity instanceof EntityExpression && select.entity.metaData) {
                    const metaData = select.entity.metaData;
                    if (!(metaData instanceof RelationDataMetaData)) {
                        resolveCache.reverseRelationMap = new Map();
                        for (const include of select.includes) {
                            const relationMeta = metaData.relations.first((o) => o.propertyName === include.name);
                            let reverseRelation;
                            if (relationMeta) {
                                reverseRelation = relationMeta.reverseRelation;
                            }
                            resolveCache.reverseRelationMap.set(include, reverseRelation);
                        }
                    }
                }
            }
        }
        return resolveCache;
    }
    parseData(queryResults, dbContext) {
        const results = [];
        const resolveMap = new Map();
        const loops = this.orderedSelects.toArray();
        for (let i = loops.length - 1; i >= 0; i--) {
            const queryResult = queryResults[i];
            if (!queryResult.rows) {
                continue;
            }
            const data = queryResult.rows;
            if (!data.any()) {
                continue;
            }
            let select = loops[i];
            const itemMap = new Map();
            resolveMap.set(select, itemMap);
            let dbEventEmitter = null;
            const isGroup = select instanceof GroupByExpression && !select.isAggregate;
            if (isGroup) {
                select = select.itemSelect;
            }
            const resolveCache = this.getResolveData(select, dbContext);
            if (resolveCache.dbSet) {
                dbEventEmitter = new DBEventEmitter(resolveCache.dbSet.metaData, dbContext);
            }
            for (const row of queryResult.rows) {
                const entity = this.parseEntity(select, row, resolveCache, resolveMap, dbContext, itemMap, dbEventEmitter);
                if (i === 0) {
                    if (isGroup) {
                        results.add(entity);
                    }
                    else {
                        results.push(entity);
                    }
                }
            }
        }
        return results;
    }
    parseEntity(select, row, resolveCache, resolveMap, dbContext, itemMap, dbEventEmitter) {
        let entity;
        let entry;
        const parentRelation = select.parentRelation;
        const reverseRelationMap = resolveCache.reverseRelationMap;
        const dbSet = resolveCache.dbSet;
        if (resolveCache.isValueType) {
            const column = resolveCache.column;
            entity = this.getColumnValue(column, row, dbContext);
        }
        else {
            entity = new select.itemType();
            // load existing entity
            if (dbSet) {
                for (const primaryCol of resolveCache.primaryColumns) {
                    this.setColumnValue(entity, primaryCol, row, dbContext);
                }
                entry = dbSet.entry(entity);
                if (entry.state === EntityState.Detached) {
                    entry.state = EntityState.Unchanged;
                }
                else {
                    entity = entry.entity;
                }
                if (entry) {
                    entry.enableTrackChanges = false;
                }
            }
            for (const column of resolveCache.columns) {
                this.setColumnValue(entry || entity, column, row, dbContext);
            }
        }
        let relationData = {
            entity: entity,
            entry: entry
        };
        for (const include of select.includes) {
            if (include.isEmbedded) {
                const childResolveCache = this.getResolveData(include.child, dbContext);
                const child = this.parseEntity(include.child, row, childResolveCache, resolveMap, dbContext);
                entity[include.name] = child;
            }
            else {
                const relationValue = this.parseInclude(include, row, resolveMap);
                if (include.type === "many") {
                    if (!entity[include.name]) {
                        entity[include.name] = [];
                    }
                    let relationMeta;
                    if (dbSet && include.child.entity.isRelationData) {
                        relationMeta = dbSet.metaData.relations.first((o) => o.propertyName === include.name);
                    }
                    for (const data of relationValue) {
                        entity[include.name].push(data.entity);
                        if (relationMeta) {
                            const relationEntry = entry.getRelation(relationMeta.propertyName, data.entry);
                            relationEntry.relationData = data.data.entity;
                        }
                    }
                }
                else {
                    const relVal = relationValue.first();
                    if (relVal) {
                        entity[include.name] = relVal.entity;
                        if (select.entity.isRelationData && include.name === parentRelation.name) {
                            relVal.data = relationData;
                            relationData = relVal;
                        }
                    }
                    else {
                        entity[include.name] = null;
                    }
                }
                if (dbSet) {
                    const reverseRelation = reverseRelationMap.get(include);
                    if (reverseRelation) {
                        const childEntities = Array.isArray(relationValue) ? relationValue : [relationValue];
                        for (const child of childEntities) {
                            if (reverseRelation.relationType === "many") {
                                let entityPropValues = child.entity[reverseRelation.propertyName];
                                if (!entityPropValues) {
                                    child.entity[reverseRelation.propertyName] = [];
                                    // needed coz array is converted to ObservableArray and get new reference.
                                    entityPropValues = child.entity[reverseRelation.propertyName];
                                }
                                entityPropValues.push(entity);
                            }
                            else {
                                child.entity[reverseRelation.propertyName] = entity;
                            }
                        }
                    }
                }
            }
        }
        if (itemMap && parentRelation) {
            let key = 0;
            for (const [parentCol, childCol] of parentRelation.relationMap()) {
                key = hashCode(parentCol.propertyName + ":" + this.getColumnValue(childCol, row, dbContext), key);
            }
            if (parentRelation.type === "many") {
                let values = itemMap.get(key);
                if (!values) {
                    values = [];
                    itemMap.set(key, values);
                }
                values.push(relationData);
            }
            else {
                itemMap.set(key, relationData);
            }
        }
        if (entry) {
            entry.enableTrackChanges = true;
        }
        // emit after load event
        if (dbEventEmitter) {
            dbEventEmitter.emitAfterLoadEvent(entity);
        }
        if (select instanceof GroupedExpression && !select.groupByExp.isAggregate) {
            let groupMap = resolveMap.get(select.groupByExp);
            if (!groupMap) {
                groupMap = new Map();
                resolveMap.set(select.groupByExp, groupMap);
            }
            const groupExp = select;
            let key = 0;
            for (const groupCol of groupExp.groupBy) {
                key = hashCode(groupCol.propertyName + ":" + row[groupCol.dataPropertyName], key);
            }
            let groupData = groupMap.get(key);
            if (!groupData) {
                const groupEntities = [];
                groupData = { entity: groupEntities };
                groupMap.set(key, groupData);
                const keyExp = groupExp.key;
                if (groupExp.groupByExp.keyRelation) {
                    const keyRel = groupExp.groupByExp.keyRelation;
                    if (keyRel.isEmbedded) {
                        const childResolveCache = this.getResolveData(keyRel.child, dbContext);
                        const child = this.parseEntity(keyRel.child, row, childResolveCache, resolveMap, dbContext);
                        groupEntities[keyRel.name] = child;
                    }
                    else {
                        let childMap = resolveMap.get(keyRel.child);
                        if (!childMap) {
                            childMap = new Map();
                            resolveMap.set(keyRel.child, childMap);
                        }
                        const relValue = this.parseInclude(keyRel, row, resolveMap);
                        groupEntities.key = relValue.first().entity;
                    }
                }
                else if (keyExp.entity) {
                    const columnExp = keyExp;
                    groupEntities.key = this.getColumnValue(columnExp, row, dbContext);
                }
            }
            const groupEntity = groupData.entity;
            groupEntity.push(entity);
            // relationData = groupData;
            entity = groupEntity;
        }
        return entity;
    }
    parseInclude(include, row, resolveMap) {
        const childMap = resolveMap.get(include.child);
        let key = 0;
        for (const col of include.parentColumns) {
            key = hashCode(col.propertyName + ":" + this.getColumnValue(col, row), key);
        }
        let relationValue = childMap.get(key);
        // Default many relation value is an empty Array.
        if (include.type === "many" && !relationValue) {
            relationValue = [];
        }
        if (include.type === "many") {
            return relationValue;
        }
        else {
            const results = [];
            if (relationValue) {
                results.push(relationValue);
            }
            return results;
        }
    }
    setColumnValue(entryOrEntity, column, data, dbContext) {
        const value = this.getColumnValue(column, data, dbContext);
        let entity;
        if (entryOrEntity instanceof EntityEntry) {
            if (isValueType(value)) {
                entryOrEntity.setOriginalValue(column.propertyName, value);
                return;
            }
            else {
                entity = entryOrEntity.entity;
            }
        }
        else {
            entity = entryOrEntity;
        }
        entity[column.propertyName] = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUE9KT1F1ZXJ5UmVzdWx0UGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L1BPSk9RdWVyeVJlc3VsdFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc5RCxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3ZELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRWpGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBdUJuRixNQUFNLE9BQU8scUJBQXFCO0lBQWxDO1FBY1ksV0FBTSxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO0lBaVUvRCxDQUFDO0lBOVVHLElBQVcsY0FBYztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDOUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sUUFBUSxHQUFHLE1B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