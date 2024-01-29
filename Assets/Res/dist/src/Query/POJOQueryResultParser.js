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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUE9KT1F1ZXJ5UmVzdWx0UGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvUE9KT1F1ZXJ5UmVzdWx0UGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFFakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDakYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUF1Qm5GLE1BQU0sT0FBTyxxQkFBcUI7SUFBbEM7UUFjWSxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7SUFpVS9ELENBQUM7SUE5VUcsSUFBVyxjQUFjO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxRSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFLTSxLQUFLLENBQUMsWUFBNEIsRUFBRSxTQUFvQjtRQUMzRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDTyxjQUFjLENBQVEsTUFBZ0MsRUFBRSxJQUFTLEVBQUUsU0FBcUI7UUFDNUYsTUFBTSxVQUFVLEdBQW9CLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMvSCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBQ08sY0FBYyxDQUFRLE1BQStCLEVBQUUsU0FBb0I7UUFDL0UsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2hCLFlBQVksR0FBRztnQkFDWCxXQUFXLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3pDLEtBQUssRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFRLE1BQU0sQ0FBQyxRQUE4QixDQUFDO2FBQ3JFLENBQUM7WUFDRixJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0IsWUFBWSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pELENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUM7Z0JBQzNGLFlBQVksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO2dCQUM3QyxZQUFZLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBRXRDLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNyQixZQUFZLENBQUMsY0FBYyxHQUFHLGNBQWMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkwsY0FBYyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBRWxDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDN0QsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQzNCLFlBQVksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUNuQyxDQUFDO2dCQUVELElBQUksTUFBTSxDQUFDLE1BQU0sWUFBWSxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN0RSxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLENBQUMsUUFBUSxZQUFZLG9CQUFvQixDQUFDLEVBQUUsQ0FBQzt3QkFDOUMsWUFBWSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQzVDLEtBQUssTUFBTSxPQUFPLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNwQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3RGLElBQUksZUFBa0MsQ0FBQzs0QkFDdkMsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQ0FDZixlQUFlLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQzs0QkFDbkQsQ0FBQzs0QkFDRCxZQUFZLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQzt3QkFDbEUsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFDTyxTQUFTLENBQVEsWUFBNEIsRUFBRSxTQUFvQjtRQUN2RSxNQUFNLE9BQU8sR0FBWSxFQUFFLENBQUM7UUFDNUIsTUFBTSxVQUFVLEdBQWdCLElBQUksR0FBRyxFQUFrRixDQUFDO1FBQzFILE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDekMsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BCLFNBQVM7WUFDYixDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQ2QsU0FBUztZQUNiLENBQUM7WUFFRCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQTJELENBQUM7WUFDbkYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFaEMsSUFBSSxjQUFjLEdBQTBCLElBQUksQ0FBQztZQUNqRCxNQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksaUJBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQzNFLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxHQUFJLE1BQTRCLENBQUMsVUFBVSxDQUFDO1lBQ3RELENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFRLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBbUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsSCxDQUFDO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRTNHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNWLElBQUksT0FBTyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDeEIsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3pCLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNPLFdBQVcsQ0FBUSxNQUErQixFQUFFLEdBQVEsRUFBRSxZQUFpQyxFQUFFLFVBQXVCLEVBQUUsU0FBcUIsRUFBRSxPQUFzRSxFQUFFLGNBQXNDO1FBQ25RLElBQUksTUFBVyxDQUFDO1FBQ2hCLElBQUksS0FBeUIsQ0FBQztRQUU5QixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBaUMsQ0FBQztRQUNoRSxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztRQUMzRCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2pDLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDbkMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sR0FBRyxJQUFLLE1BQU0sQ0FBQyxRQUF3QixFQUFFLENBQUM7WUFDaEQsdUJBQXVCO1lBQ3ZCLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxNQUFNLFVBQVUsSUFBSSxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQzVELENBQUM7Z0JBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3ZDLEtBQUssQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztnQkFDeEMsQ0FBQztxQkFDSSxDQUFDO29CQUNGLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUMxQixDQUFDO2dCQUNELElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFDckMsQ0FBQztZQUNMLENBQUM7WUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLElBQUksTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakUsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLFlBQVksR0FBMEI7WUFDdEMsTUFBTSxFQUFFLE1BQU07WUFDZCxLQUFLLEVBQUUsS0FBSztTQUNmLENBQUM7UUFDRixLQUFLLE1BQU0sT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3hFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNqQyxDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUM5QixDQUFDO29CQUVELElBQUksWUFBc0MsQ0FBQztvQkFDM0MsSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQy9DLFlBQVksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxRixDQUFDO29CQUNELEtBQUssTUFBTSxJQUFJLElBQUksYUFBYSxFQUFFLENBQUM7d0JBQy9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxZQUFZLEVBQUUsQ0FBQzs0QkFDZixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUMvRSxhQUFhLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNsRCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztxQkFDSSxDQUFDO29CQUNGLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7d0JBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ3ZFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDOzRCQUMzQixZQUFZLEdBQUcsTUFBTSxDQUFDO3dCQUMxQixDQUFDO29CQUNMLENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDaEMsQ0FBQztnQkFDTCxDQUFDO2dCQUVELElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1IsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN4RCxJQUFJLGVBQWUsRUFBRSxDQUFDO3dCQUNsQixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQ3JGLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxFQUFFLENBQUM7NEJBQ2hDLElBQUksZUFBZSxDQUFDLFlBQVksS0FBSyxNQUFNLEVBQUUsQ0FBQztnQ0FDMUMsSUFBSSxnQkFBZ0IsR0FBVSxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDekUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0NBQ3BCLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQ0FDaEQsMEVBQTBFO29DQUMxRSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDbEUsQ0FBQztnQ0FDRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2xDLENBQUM7aUNBQ0ksQ0FBQztnQ0FDRixLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUM7NEJBQ3hELENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksT0FBTyxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQzVCLElBQUksR0FBRyxHQUFXLENBQUMsQ0FBQztZQUNwQixLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQy9ELEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RHLENBQUM7WUFDRCxJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUE0QixDQUFDO2dCQUN6RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ1YsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzlCLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksS0FBSyxFQUFFLENBQUM7WUFDUixLQUFLLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLENBQUM7UUFFRCx3QkFBd0I7UUFDeEIsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNqQixjQUFjLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksTUFBTSxZQUFZLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4RSxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ1osUUFBUSxHQUFHLElBQUksR0FBRyxFQUEyRCxDQUFDO2dCQUM5RSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLE1BQTJCLENBQUM7WUFDN0MsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDO1lBQ3BCLEtBQUssTUFBTSxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QyxHQUFHLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN0RixDQUFDO1lBRUQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQTBCLENBQUM7WUFDM0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNiLE1BQU0sYUFBYSxHQUEwQixFQUFTLENBQUM7Z0JBQ3ZELFNBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQztnQkFDdEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRTdCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQzVCLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7b0JBQy9DLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNwQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFDdkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQzVGLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO29CQUN2QyxDQUFDO3lCQUNJLENBQUM7d0JBQ0YsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzVDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDWixRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs0QkFDckIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUMzQyxDQUFDO3dCQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDNUQsYUFBYSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDO29CQUNoRCxDQUFDO2dCQUNMLENBQUM7cUJBQ0ksSUFBSyxNQUE0QixDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1QyxNQUFNLFNBQVMsR0FBRyxNQUEyQixDQUFDO29CQUM5QyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztZQUNMLENBQUM7WUFFRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBK0IsQ0FBQztZQUM5RCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLDRCQUE0QjtZQUM1QixNQUFNLEdBQUcsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ08sWUFBWSxDQUFRLE9BQStCLEVBQUUsR0FBUSxFQUFFLFVBQXVCO1FBQzFGLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLElBQUksR0FBRyxHQUFXLENBQUMsQ0FBQztRQUNwQixLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDRCxJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRDLGlEQUFpRDtRQUNqRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQzFCLE9BQU8sYUFBd0MsQ0FBQztRQUNwRCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sT0FBTyxHQUE0QixFQUFFLENBQUM7WUFDNUMsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFvQixDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBQ08sY0FBYyxDQUFRLGFBQXlDLEVBQUUsTUFBZ0MsRUFBRSxJQUFTLEVBQUUsU0FBcUI7UUFDdkksTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNELElBQUksTUFBYSxDQUFDO1FBQ2xCLElBQUksYUFBYSxZQUFZLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMzRCxPQUFPO1lBQ1gsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sR0FBRyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hDLENBQUM7Q0FDSiJ9