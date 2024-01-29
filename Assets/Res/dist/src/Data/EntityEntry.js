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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5RW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EYXRhL0VudGl0eUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSw0QkFBNEIsRUFBRSw4QkFBOEIsRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZLLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBSzlFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLE9BQU8sV0FBVztJQUNwQixJQUFXLGtCQUFrQjtRQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksc0JBQXNCLENBQUMsQ0FBQzthQUNsRixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxD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