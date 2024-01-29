import { ColumnGeneration } from "../Common/Enum";
import { ParameterStack } from "../Common/ParameterStack";
import { entityMetaKey } from "../Decorator/DecoratorKey";
import { Enumerable } from "../Enumerable/Enumerable";
import { hashCode, isNull, isValue } from "../Helper/Util";
import { BulkDeferredQuery } from "../Query/DeferredQuery/BulkDeferredQuery";
import { Queryable } from "../Queryable/Queryable";
import { EntityExpression } from "../Queryable/QueryExpression/EntityExpression";
import { SelectExpression } from "../Queryable/QueryExpression/SelectExpression";
import { EntityEntry } from "./EntityEntry";
export class DbSet extends Queryable {
    get stackTree() {
        return this._param;
    }
    get dbContext() {
        return this._dbContext;
    }
    get local() {
        return Enumerable.from(this.dictionary).select((o) => o[1].entity);
    }
    get metaData() {
        if (!this._metaData) {
            this._metaData = Reflect.getOwnMetadata(entityMetaKey, this.type);
        }
        return this._metaData;
    }
    get primaryKeys() {
        return this.metaData.primaryKeys;
    }
    get queryOption() {
        return {};
    }
    constructor(type, dbContext) {
        super(type);
        this.type = type;
        this.dictionary = new Map();
        this._dbContext = dbContext;
        this._param = {
            node: new ParameterStack(),
            childrens: []
        };
    }
    buildQuery(visitor) {
        const result = new SelectExpression(new EntityExpression(this.type, visitor.newAlias()));
        result.parameterTree = {
            node: [],
            childrens: []
        };
        visitor.setDefaultBehaviour(result);
        return result;
    }
    clear() {
        this.dictionary = new Map();
    }
    deferredDelete(modeOrKeyOrPredicate, mode) {
        if (modeOrKeyOrPredicate instanceof Function || typeof modeOrKeyOrPredicate === "string") {
            return super.deferredDelete(modeOrKeyOrPredicate, mode);
        }
        else {
            return this.dbContext.getDeleteQuery(this.entry(modeOrKeyOrPredicate), mode);
        }
    }
    deferredInsert(...items) {
        if (!items.any()) {
            throw new Error("empty items");
        }
        if (!Reflect.getOwnMetadata(entityMetaKey, this.type)) {
            throw new Error(`Only entity supported`);
        }
        const defers = [];
        for (const item of items) {
            const entry = this.entry(item);
            defers.push(this.dbContext.getInsertQuery(entry));
        }
        return new BulkDeferredQuery(this.dbContext, defers);
    }
    // Prevent Update all records
    update(item) {
        return this.deferredUpdate(item).execute();
    }
    // Prevent Update all records
    deferredUpdate(item) {
        return this.dbContext.getUpdateQuery(this.dbContext.entry(item));
    }
    deferredUpsert(item) {
        return this.dbContext.getUpsertQuery(this.dbContext.add(item));
    }
    entry(entity) {
        const key = this.getKey(entity);
        let entry = this.dictionary.get(key);
        if (entry) {
            if (entry.entity !== entity) {
                entry.setOriginalValues(entity);
            }
        }
        else {
            if (!(entity instanceof this.type)) {
                const entityType = new this.type();
                entry = new EntityEntry(this, entityType, key);
                entry.setOriginalValues(entity);
            }
            else {
                entry = new EntityEntry(this, entity, key);
            }
            this.dictionary.set(key, entry);
        }
        return entry;
    }
    async find(id, forceReload) {
        let entity = forceReload ? null : this.findLocal(id);
        if (!entity) {
            entity = await super.find(id);
        }
        return entity;
    }
    findLocal(id) {
        const key = this.getKey(id);
        const entry = this.dictionary.get(key);
        return entry ? entry.entity : undefined;
    }
    getKey(id) {
        if (isNull(id)) {
            throw new Error("Parameter cannot be null");
        }
        if (isValue(id)) {
            return id.toString();
        }
        let keyString = "";
        let useReference = false;
        for (const o of this.primaryKeys) {
            const val = id[o.propertyName];
            if (!val) {
                if (o.generation & ColumnGeneration.Insert) {
                    useReference = true;
                }
                else {
                    throw new Error(`primary key "${o.propertyName.toString()}" required`);
                }
                break;
            }
            else {
                keyString += val.toString() + "|";
            }
        }
        if (useReference) {
            return id;
        }
        return keyString.slice(0, -1);
    }
    hashCode() {
        return hashCode(this.type.name);
    }
    insert(...items) {
        return this.deferredInsert(...items).execute().then((o) => o.sum());
    }
    new(primaryValue) {
        const entity = new this.type();
        if (isValue(primaryValue)) {
            if (this.primaryKeys.length !== 1) {
                throw new Error(`${this.type.name} has multiple primary keys`);
            }
            entity[this.primaryKeys.first().propertyName] = primaryValue;
        }
        else {
            if (this.primaryKeys.any((o) => !(o.generation & ColumnGeneration.Insert) && !o.defaultExp && !primaryValue[o.propertyName])) {
                throw new Error(`Primary keys is required`);
            }
            for (const prop in primaryValue) {
                entity[prop] = primaryValue[prop];
            }
        }
        this.dbContext.add(entity);
        return entity;
    }
    updateEntryKey(entry) {
        this.dictionary.delete(entry.key);
        entry.key = this.getKey(entry.entity);
        this.dictionary.set(entry.key, entry);
    }
    upsert(item) {
        return this.deferredUpsert(item).execute();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJTZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGF0YS9EYlNldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV0RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUczRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUs3RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFFakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFFakYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1QyxNQUFNLE9BQU8sS0FBUyxTQUFRLFNBQVk7SUFDdEMsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBQ0QsSUFBVyxLQUFLO1FBQ1osT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0Qs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