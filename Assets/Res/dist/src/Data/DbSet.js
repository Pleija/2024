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
                    throw new Error(`primary key "${o.propertyName}" required`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJTZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EYXRhL0RiU2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xELE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUdyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXRELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzNELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBSzdFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUVqRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUVqRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVDLE1BQU0sT0FBTyxLQUFTLFNBQVEsU0FBWTtJQUN0QyxJQUFXLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFXLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFXLEtBQUs7UUFDWixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRCxJ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