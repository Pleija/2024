import { propertyChangeDispatherMetaKey, propertyChangeHandlerMetaKey, relationChangeDispatherMetaKey, relationChangeHandlerMetaKey } from "../Decorator/DecoratorKey";
import { EventHandlerFactory } from "../Event/EventHandlerFactory";
import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MemberAccessExpression } from "../ExpressionBuilder/Expression/MemberAccessExpression";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { ExpressionExecutor } from "../ExpressionBuilder/ExpressionExecutor";
import { ComputedColumnMetaData } from "../MetaData/ComputedColumnMetaData";
import { EmbeddedRelationMetaData } from "../MetaData/EmbeddedColumnMetaData";
import { EntityState } from "./EntityState";
import { RelationEntry } from "./RelationEntry";
import { RelationState } from "./RelationState";
export class EntityEntry {
    get isCompletelyLoaded() {
        return this.dbSet.metaData.columns.where((o) => !(o instanceof ComputedColumnMetaData))
            .all((o) => this.entity[o.propertyName] !== undefined);
    }
    get metaData() {
        return this.dbSet.metaData;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state !== value) {
            const dbContext = this.dbSet.dbContext;
            switch (this.state) {
                case EntityState.Added: {
                    const typedAddEntries = dbContext.entityEntries.add.get(this.metaData);
                    if (typedAddEntries) {
                        typedAddEntries.delete(this);
                    }
                    break;
                }
                case EntityState.Deleted: {
                    const typedEntries = dbContext.entityEntries.delete.get(this.metaData);
                    if (typedEntries) {
                        typedEntries.delete(this);
                    }
                    break;
                }
                case EntityState.Modified: {
                    const typedEntries = dbContext.entityEntries.update.get(this.metaData);
                    if (typedEntries) {
                        typedEntries.delete(this);
                    }
                    break;
                }
                case EntityState.Detached: {
                    // load all relation
                    break;
                }
            }
            switch (value) {
                case EntityState.Added: {
                    let typedEntries = dbContext.entityEntries.add.get(this.metaData);
                    if (!typedEntries) {
                        typedEntries = [];
                        dbContext.entityEntries.add.set(this.metaData, typedEntries);
                    }
                    typedEntries.push(this);
                    break;
                }
                case EntityState.Deleted: {
                    let typedEntries = dbContext.entityEntries.delete.get(this.metaData);
                    if (!typedEntries) {
                        typedEntries = [];
                        dbContext.entityEntries.delete.set(this.metaData, typedEntries);
                    }
                    typedEntries.push(this);
                    break;
                }
                case EntityState.Modified: {
                    let typedEntries = dbContext.entityEntries.update.get(this.metaData);
                    if (!typedEntries) {
                        typedEntries = [];
                        dbContext.entityEntries.update.set(this.metaData, typedEntries);
                    }
                    typedEntries.push(this);
                    break;
                }
            }
            this._state = value;
        }
    }
    constructor(dbSet, entity, key) {
        this.dbSet = dbSet;
        this.entity = entity;
        this.key = key;
        this.enableTrackChanges = true;
        this.relationMap = {};
        this._originalValues = new Map();
        this._state = EntityState.Detached;
        let propertyChangeHandler = entity[propertyChangeHandlerMetaKey];
        if (!propertyChangeHandler) {
            let propertyChangeDispatcher;
            [propertyChangeHandler, propertyChangeDispatcher] = EventHandlerFactory(entity);
            entity[propertyChangeHandlerMetaKey] = propertyChangeHandler;
            entity[propertyChangeDispatherMetaKey] = propertyChangeDispatcher;
        }
        propertyChangeHandler.add((source, args) => this.onPropertyChanged(args));
        let relationChangeHandler = entity[relationChangeHandlerMetaKey];
        if (!relationChangeHandler) {
            let relationChangeDispatcher;
            [relationChangeHandler, relationChangeDispatcher] = EventHandlerFactory(entity);
            entity[relationChangeHandlerMetaKey] = relationChangeHandler;
            entity[relationChangeDispatherMetaKey] = relationChangeDispatcher;
        }
        relationChangeHandler.add((source, args) => this.onRelationChanged(args));
    }
    acceptChanges(...properties) {
        if (properties.any() && this.state !== EntityState.Modified) {
            return;
        }
        switch (this.state) {
            case EntityState.Modified: {
                let acceptedProperties = [];
                if (properties.any()) {
                    for (const prop of properties) {
                        const isDeleted = this._originalValues.delete(prop);
                        if (isDeleted) {
                            acceptedProperties.push(prop);
                        }
                    }
                }
                else {
                    acceptedProperties = Array.from(this._originalValues.keys());
                    this._originalValues.clear();
                }
                for (const prop of acceptedProperties.intersect(this.metaData.primaryKeys.select((o) => o.propertyName))) {
                    // reflect update option
                    const relations = this.metaData.relations
                        .where((rel) => rel.isMaster && rel.relationColumns.any((o) => o.propertyName === prop)
                        && (rel.updateOption === "CASCADE" || rel.updateOption === "SET NULL" || rel.updateOption === "SET DEFAULT"));
                    for (const rel of relations) {
                        const relationData = this.relationMap[rel.propertyName];
                        if (!relationData) {
                            continue;
                        }
                        const col = rel.relationColumns.first((o) => o.propertyName === prop);
                        const rCol = rel.relationMaps.get(col);
                        for (const relEntry of relationData.values()) {
                            switch (rel.updateOption) {
                                case "CASCADE": {
                                    relEntry.slaveEntry[rCol.propertyName] = this.entity[prop];
                                    break;
                                }
                                case "SET NULL": {
                                    relEntry.slaveEntry[rCol.propertyName] = null;
                                    break;
                                }
                                case "SET DEFAULT": {
                                    relEntry.slaveEntry[rCol.propertyName] = rCol ? ExpressionExecutor.execute(rCol.defaultExp) : null;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (this._originalValues.size <= 0) {
                    this.state = EntityState.Unchanged;
                }
                break;
            }
            case EntityState.Deleted: {
                this.state = EntityState.Detached;
                for (const relMeta of this.dbSet.metaData.relations) {
                    let relEntities = [];
                    const relProp = this.entity[relMeta.propertyName];
                    if (Array.isArray(relProp)) {
                        relEntities = relEntities.concat(this.entity[relMeta.propertyName]);
                    }
                    else if (relProp) {
                        relEntities = [relProp];
                    }
                    if (relMeta.reverseRelation.relationType === "one") {
                        relEntities.forEach((o) => o[relMeta.reverseRelation.propertyName] = null);
                    }
                    else {
                        relEntities.forEach((o) => o[relMeta.reverseRelation.propertyName].delete(this.entity));
                    }
                    // apply delete option
                    const relations = this.metaData.relations
                        .where((o) => o.isMaster
                        && (o.updateOption === "CASCADE" || o.updateOption === "SET NULL" || o.updateOption === "SET DEFAULT"));
                    for (const o of relations) {
                        const relEntryMap = this.relationMap[o.propertyName];
                        if (!relEntryMap) {
                            continue;
                        }
                        for (const relEntry of relEntryMap.values()) {
                            switch (o.updateOption) {
                                case "CASCADE": {
                                    relEntry.slaveEntry.state = EntityState.Deleted;
                                    relEntry.slaveEntry.acceptChanges();
                                    break;
                                }
                                case "SET NULL": {
                                    for (const rCol of relEntry.slaveRelation.mappedRelationColumns) {
                                        relEntry.slaveEntry[rCol.propertyName] = null;
                                        relEntry.slaveEntry.acceptChanges(rCol.propertyName);
                                    }
                                    break;
                                }
                                case "SET DEFAULT": {
                                    for (const rCol of relEntry.slaveRelation.mappedRelationColumns) {
                                        if (rCol.defaultExp) {
                                            relEntry.slaveEntry[rCol.propertyName] = ExpressionExecutor.execute(rCol.defaultExp);
                                            relEntry.slaveEntry.acceptChanges(rCol.propertyName);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            }
            case EntityState.Added: {
                this.state = EntityState.Unchanged;
            }
        }
    }
    add() {
        this.state = this.state === EntityState.Deleted ? EntityState.Unchanged : EntityState.Added;
    }
    delete() {
        this.state = this.state === EntityState.Added || this.state === EntityState.Detached ? EntityState.Detached : EntityState.Deleted;
    }
    getModifiedProperties() {
        return Array.from(this._originalValues.keys());
    }
    getOriginalValue(prop) {
        if (this._originalValues.has(prop)) {
            return this._originalValues.get(prop);
        }
        return this.entity[prop];
    }
    getPrimaryValues() {
        const res = {};
        for (const o of this.dbSet.primaryKeys) {
            res[o.propertyName] = this.entity[o.propertyName];
        }
        return res;
    }
    //#region Relations
    getRelation(propertyName, relatedEntry) {
        const relationMeta = this.metaData.relations.first((o) => o.propertyName === propertyName);
        let relGroup = this.relationMap[propertyName];
        if (!relGroup) {
            relGroup = new Map();
            this.relationMap[propertyName] = relGroup;
        }
        let relEntry = relGroup.get(relatedEntry);
        if (!relEntry) {
            if (relationMeta.isMaster) {
                relEntry = relatedEntry.getRelation(relationMeta.reverseRelation.propertyName, this);
            }
            else {
                relEntry = new RelationEntry(this, relatedEntry, relationMeta);
            }
            relGroup.set(relatedEntry, relEntry);
        }
        return relEntry;
    }
    isPropertyModified(prop) {
        return this._originalValues.has(prop);
    }
    /**
     * Load relation to this entity.
     */
    async loadRelation(...relations) {
        const paramExp = new ParameterExpression("o", this.dbSet.type);
        const projected = this.dbSet.primaryKeys.select((o) => new FunctionExpression(new MemberAccessExpression(paramExp, o.propertyName), [paramExp])).toArray();
        await this.dbSet.project(...projected).include(...relations).find(this.getPrimaryValues());
    }
    //#region asd
    /**
     * Reloads the entity from the database overwriting any property values with values from the database.
     * For modified properties, then the original value will be overwrite with vallue from the database.
     * Note: To get clean entity from database, call resetChanges after reload.
     */
    async reload() {
        await this.dbSet.find(this.getPrimaryValues(), true);
    }
    //#endregion
    buildRelation(...relations) {
        let relationMetas = this.metaData.relations;
        if (relations.any()) {
            if (typeof relations[0] === "object") {
                relationMetas = relations;
            }
            else {
                relationMetas = relationMetas.where((o) => relations.contains(o.propertyName)).toArray();
            }
        }
        for (const relMeta of relationMetas) {
            this.entity[relMeta.propertyName] = this.relatedEntity(relMeta);
        }
    }
    relatedEntity(relation) {
        if (!relation) {
            return null;
        }
        const set = this.dbSet.dbContext.set(relation.target.type);
        if (!set) {
            return null;
        }
        if (relation.relationType === "many") {
            let enumerable = set.local;
            for (const [col, tCol] of relation.relationMaps) {
                const propVal = this.entity[col.propertyName];
                if (propVal === undefined) {
                    return undefined;
                }
                enumerable = enumerable.where((o) => o[tCol.propertyName] === propVal);
            }
            return enumerable.toArray();
        }
        else {
            const key = {};
            for (const [col, tCol] of relation.relationMaps) {
                const propVal = this.entity[col.propertyName];
                if (propVal === undefined) {
                    return undefined;
                }
                key[tCol.propertyName] = propVal;
            }
            return set.findLocal(key);
        }
    }
    resetChanges(...properties) {
        if (!properties.any()) {
            properties = Array.from(this._originalValues.keys());
        }
        for (const prop of properties) {
            if (this._originalValues.has(prop)) {
                this.entity[prop] = this._originalValues.get(prop);
            }
        }
    }
    setOriginalValue(property, value) {
        if (!(property in this.entity)) {
            return;
        }
        if (this.entity[property] === value) {
            this._originalValues.delete(property);
        }
        else if (this.isPropertyModified(property)) {
            this._originalValues.set(property, value);
        }
        else {
            this.enableTrackChanges = false;
            this.entity[property] = value;
            this.enableTrackChanges = true;
        }
    }
    setOriginalValues(originalValues) {
        for (const prop in originalValues) {
            const value = originalValues[prop];
            this.setOriginalValue(prop, value);
        }
        this.state = this._originalValues.size > 0 ? EntityState.Modified : EntityState.Unchanged;
    }
    onRelationChanged(param) {
        for (let item of param.entities) {
            if (item === undefined && param.relation.relationType === "one") {
                // undefined means relation may exist or not, so check related entity from context
                item = this.relatedEntity(param.relation);
                if (!item) {
                    continue;
                }
            }
            const entry = this.dbSet.dbContext.entry(item);
            const relationEntry = this.getRelation(param.relation.propertyName, entry);
            if (this.enableTrackChanges) {
                switch (param.type) {
                    case "add": {
                        if (relationEntry.state !== RelationState.Unchanged) {
                            relationEntry.add();
                        }
                        break;
                    }
                    case "del":
                        if (relationEntry.state !== RelationState.Detached) {
                            relationEntry.delete();
                        }
                        break;
                }
            }
            else {
                relationEntry.state = RelationState.Unchanged;
            }
        }
    }
    onPropertyChanged(param) {
        if (this.dbSet.primaryKeys.contains(param.column)) {
            // primary key changed, update dbset entry dictionary.
            this.dbSet.updateEntryKey(this);
        }
        if (param.oldValue !== param.newValue && param.column instanceof EmbeddedRelationMetaData) {
            const embeddedDbSet = this.dbSet.dbContext.set(param.column.target.type);
            new EmbeddedEntityEntry(embeddedDbSet, param.newValue, this);
        }
        if (this.enableTrackChanges && (this.state === EntityState.Modified || this.state === EntityState.Unchanged) && param.oldValue !== param.newValue) {
            const oriValue = this._originalValues.get(param.column.propertyName);
            if (oriValue === param.newValue) {
                this._originalValues.delete(param.column.propertyName);
                if (this._originalValues.size <= 0) {
                    this.state = EntityState.Unchanged;
                }
            }
            else if (oriValue === undefined && param.oldValue !== undefined && !param.column.isReadOnly) {
                this._originalValues.set(param.column.propertyName, param.oldValue);
                if (this.state === EntityState.Unchanged) {
                    this.state = EntityState.Modified;
                }
            }
        }
    }
}
import { EmbeddedEntityEntry } from "./EmbeddedEntityEntry";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5RW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGF0YS9FbnRpdHlFbnRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsOEJBQThCLEVBQUUsNEJBQTRCLEVBQUUsOEJBQThCLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2SyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVuRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUN4RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUNoRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUs5RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxPQUFPLFdBQVc7SUFDcEIsSUFBVyxrQkFBa0I7UUFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLHNCQUFzQixDQUFDLENBQUM7YUFDbEYsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMs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