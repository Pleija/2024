import { QueryType } from "../Common/Enum";
import { DefaultConnectionManager } from "../Connection/DefaultConnectionManager";
import { Diagnostic } from "../Logger/Diagnostic";
import { DMLDeferredQuery } from "../Query/DeferredQuery/DMLDeferredQuery";
import { DQLDeferredQuery } from "../Query/DeferredQuery/DQLDeferredQuery";
import { ExecuteDeferredQuery } from "../Query/DeferredQuery/ExecuteDeferredQuery";
import { RawQueryable } from "../Queryable/RawQueryable";
import { DbSet } from "./DbSet";
import { EntityState } from "./EntityState";
import { RelationState } from "./RelationState";
const connectionManagerKey = Symbol("connectionManagerKey");
const queryCacheManagerKey = Symbol("queryCacheManagerKey");
const resultCacheManagerKey = Symbol("resultCacheManagerKey");
export class DbContext {
    get connectionManager() {
        if (!this._connectionManager) {
            this._connectionManager = Reflect.getOwnMetadata(connectionManagerKey, this.constructor);
            if (!this._connectionManager) {
                const conManagerOrDriver = this.factory();
                if (conManagerOrDriver.getAllConnections) {
                    this._connectionManager = conManagerOrDriver;
                }
                else {
                    const driver = conManagerOrDriver;
                    this._connectionManager = new DefaultConnectionManager(driver);
                }
                Reflect.defineMetadata(connectionManagerKey, this._connectionManager, this.constructor);
            }
        }
        return this._connectionManager;
    }
    get queryBuilder() {
        const queryBuilder = new this.queryBuilderType();
        queryBuilder.namingStrategy = this.namingStrategy;
        return queryBuilder;
    }
    get queryCacheManager() {
        if (!this._queryCacheManager && this.queryCacheManagerFactory) {
            this._queryCacheManager = Reflect.getOwnMetadata(queryCacheManagerKey, this.constructor);
            if (!this._queryCacheManager) {
                this._queryCacheManager = this.queryCacheManagerFactory();
                Reflect.defineMetadata(queryCacheManagerKey, this._queryCacheManager, this.constructor);
            }
        }
        return this._queryCacheManager;
    }
    get queryVisitor() {
        const visitor = new this.queryVisitorType();
        visitor.namingStrategy = this.namingStrategy;
        visitor.translator = this.translator;
        return visitor;
    }
    get resultCacheManager() {
        if (!this._resultCacheManager && this.resultCacheManagerFactory) {
            this._resultCacheManager = Reflect.getOwnMetadata(resultCacheManagerKey, this.constructor);
            if (!this._resultCacheManager) {
                this._resultCacheManager = this.resultCacheManagerFactory();
                Reflect.defineMetadata(resultCacheManagerKey, this._resultCacheManager, this.constructor);
            }
        }
        return this._resultCacheManager;
    }
    constructor(factory, types = []) {
        this.deferredQueries = [];
        this.modifiedEmbeddedEntries = new Map();
        this._cachedDbSets = new Map();
        if (factory) {
            this.factory = factory;
        }
        this.relationEntries = {
            add: new Map(),
            delete: new Map()
        };
        this.entityEntries = {
            add: new Map(),
            delete: new Map(),
            update: new Map()
        };
        this.entityTypes = types;
    }
    //#region Entry
    entry(entity) {
        const set = this.set(entity.constructor);
        if (set) {
            return set.entry(entity);
        }
        return null;
    }
    attach(entity, all = false) {
        const entry = this.entry(entity);
        if (entry && entry.state === EntityState.Detached) {
            entry.state = EntityState.Unchanged;
            if (all) {
                for (const relation of entry.metaData.relations) {
                    const relEntity = entity[relation.propertyName];
                    if (relEntity) {
                        if (relation.relationType === "one") {
                            const relEntry = this.attach(relEntity, true);
                            const relationEntry = entry.getRelation(relation.propertyName, relEntry);
                            relationEntry.state = RelationState.Unchanged;
                        }
                        else if (Array.isArray(relEntity)) {
                            for (const itemEntity of relEntity) {
                                const relEntry = this.attach(itemEntity, true);
                                const relationEntry = entry.getRelation(relation.propertyName, relEntry);
                                relationEntry.state = RelationState.Unchanged;
                            }
                        }
                    }
                }
                for (const relation of entry.metaData.embeds) {
                    const relEntity = entity[relation.propertyName];
                    if (relEntity) {
                        const relEntry = this.attach(relEntity, true);
                        if (relEntry) {
                            entity[relation.propertyName] = relEntry.entity;
                        }
                    }
                }
            }
        }
        return entry;
    }
    detach(entity) {
        const entry = this.entry(entity);
        if (entry && entry.state !== EntityState.Detached) {
            entry.state = EntityState.Detached;
        }
        return entry;
    }
    add(entity) {
        const entry = this.attach(entity);
        if (entry) {
            entry.add();
        }
        return entry;
    }
    update(entity, originalValues) {
        const entry = this.attach(entity);
        if (entry) {
            if (originalValues instanceof Object) {
                entry.setOriginalValues(originalValues);
            }
            entry.state = EntityState.Modified;
        }
        return entry;
    }
    delete(entity) {
        const entry = this.attach(entity);
        if (entry) {
            entry.delete();
        }
        return entry;
    }
    relationEntry(entity1, propertyName, entity2) {
        const entry1 = this.entry(entity1);
        const entry2 = this.entry(entity2);
        return entry1.getRelation(propertyName, entry2);
    }
    relationAttach(entity1, propertyName, entity2) {
        const entry = this.relationEntry(entity1, propertyName, entity2);
        if (entry && entry.state === RelationState.Detached) {
            entry.state = RelationState.Unchanged;
        }
        return entry;
    }
    relationDetach(entity1, propertyName, entity2) {
        const entry = this.relationEntry(entity1, propertyName, entity2);
        if (entry && entry.state !== RelationState.Detached) {
            entry.state = RelationState.Detached;
        }
        return entry;
    }
    relationAdd(entity1, propertyName, entity2) {
        const entry = this.relationAttach(entity1, propertyName, entity2);
        if (entry) {
            entry.add();
        }
        return entry;
    }
    relationDelete(entity1, propertyName, entity2) {
        const entry = this.relationAttach(entity1, propertyName, entity2);
        if (entry) {
            entry.delete();
        }
        return entry;
    }
    //#endregion
    clear() {
        this.modifiedEmbeddedEntries.clear();
        this.relationEntries.add.clear();
        this.relationEntries.delete.clear();
        this.entityEntries.delete.clear();
        this.entityEntries.add.clear();
        this.entityEntries.update.clear();
        for (const [, dbSet] of this._cachedDbSets) {
            dbSet.clear();
        }
    }
    async closeConnection(con) {
        if (!con) {
            con = this.connection;
        }
        if (con && !con.inTransaction) {
            if (Diagnostic.enabled) {
                Diagnostic.trace(this, `Close connection.`);
            }
            this.connection = null;
            await con.close();
        }
    }
    // -------------------------------------------------------------------------
    // Query Function
    // -------------------------------------------------------------------------
    async executeDeferred(deferredQueries) {
        if (!deferredQueries) {
            deferredQueries = this.deferredQueries.splice(0);
        }
        // check cached
        if (this.resultCacheManager) {
            deferredQueries = deferredQueries.toArray();
            const cacheQueries = deferredQueries.where((o) => o instanceof DQLDeferredQuery && o.queryOption.resultCache !== "none");
            const cachedResults = await this.resultCacheManager.gets(cacheQueries.select((o) => o.hashCode().toString()));
            let index = 0;
            for (const cacheQuery of cacheQueries) {
                const res = cachedResults[index++];
                if (res) {
                    cacheQuery.resolve(res);
                    deferredQueries.delete(cacheQuery);
                }
            }
        }
        const queries = deferredQueries.selectMany((o) => o.queries);
        if (!queries.any()) {
            return;
        }
        const queryResult = await this.executeQueries(...queries);
        for (const deferredQuery of deferredQueries) {
            const results = queryResult.splice(0, deferredQuery.queries.length);
            deferredQuery.resolve(results);
            // cache result
            if (this.resultCacheManager) {
                if (deferredQuery instanceof DQLDeferredQuery) {
                    const queryOption = deferredQuery.queryOption;
                    if (queryOption.resultCache !== "none") {
                        const cacheOption = (queryOption.resultCache || {});
                        if (queryOption.resultCache && queryOption.resultCache.invalidateOnUpdate) {
                            cacheOption.tags = deferredQuery.entities.select((o) => `entity:${o.name}`).toArray();
                        }
                        this.resultCacheManager.set(deferredQuery.hashCode().toString(), results, cacheOption);
                    }
                }
                else if (deferredQuery instanceof DMLDeferredQuery) {
                    const effecteds = deferredQuery.entities.select((o) => `entity:${o.name}`);
                    this.resultCacheManager.removeTag(effecteds);
                }
            }
        }
    }
    //#endregion
    async executeQueries(...queries) {
        let results = [];
        if (queries.any()) {
            const con = await this.getConnection(queries.any((o) => !!(o.type & QueryType.DQL)));
            if (!con.isOpen) {
                await con.open();
            }
            const timer = Diagnostic.timer(false);
            timer && timer.start();
            if (Diagnostic.enabled) {
                Diagnostic.debug(con, `Execute Query.`, queries);
            }
            results = await con.query(...queries);
            if (Diagnostic.enabled) {
                Diagnostic.debug(con, `Query Result.`, results);
                Diagnostic.trace(con, `Execute Query time: ${timer.time()}ms`);
            }
            // No need to wait connection close
            this.closeConnection(con);
        }
        return results;
    }
    query(schema, sql, parametersOrType, type) {
        let parameters = null;
        if (!type && parametersOrType instanceof Function) {
            type = parametersOrType;
        }
        else {
            parameters = parametersOrType;
        }
        return new RawQueryable(this, schema, sql, parameters, type);
    }
    // Parameter placeholder: ${paramname}
    execute(sql, parameters) {
        const query = this.deferredExecute(sql, parameters);
        return query.execute();
    }
    deferredExecute(sql, parameters) {
        return new ExecuteDeferredQuery(this, sql, parameters);
    }
    async getConnection(writable) {
        const con = this.connection ? this.connection : await this.connectionManager.getConnection(writable);
        if (Diagnostic.enabled) {
            Diagnostic.trace(this, `Get connection. used existing connection: ${!!this.connection}`);
        }
        return con;
    }
    getQueryResultParser(command, queryBuilder) {
        const queryParser = new this.queryResultParserType();
        queryParser.queryBuilder = queryBuilder;
        queryParser.queryExpression = command;
        return queryParser;
    }
    async getUpdateSchemaQueries(entityTypes) {
        const con = await this.getConnection();
        if (!con.isOpen) {
            await con.open();
        }
        const schemaBuilder = new this.schemaBuilderType();
        schemaBuilder.connection = con;
        schemaBuilder.queryBuilder = this.queryBuilder;
        return await schemaBuilder.getSchemaQuery(entityTypes);
    }
    schemaBuilder() {
        const schemaBuilder = new this.schemaBuilderType();
        schemaBuilder.queryBuilder = this.queryBuilder;
        return schemaBuilder;
    }
    //#region Entity Tracker
    set(type, isClearCache = false) {
        let result;
        if (!isClearCache) {
            result = this._cachedDbSets.get(type);
        }
        if (!result && this.entityTypes.contains(type)) {
            result = new DbSet(type, this);
            this._cachedDbSets.set(type, result);
        }
        return result;
    }
    async syncSchema() {
        const schemaQuery = await this.getUpdateSchemaQueries(this.entityTypes);
        const commands = schemaQuery.commit;
        // must be executed to all connection in case connection manager handle replication
        const serverConnections = await this.connectionManager.getAllConnections();
        for (const serverConnection of serverConnections) {
            this.connection = serverConnection;
            await this.transaction(async () => {
                await this.executeQueries(...commands);
            });
        }
    }
    async transaction(isolationOrBody, transactionBody) {
        let isSavePoint;
        let error;
        try {
            let isolationLevel;
            if (typeof isolationOrBody === "function") {
                transactionBody = isolationOrBody;
            }
            else {
                isolationLevel = isolationOrBody;
            }
            this.connection = await this.getConnection(true);
            if (!this.connection.isOpen) {
                await this.connection.open();
            }
            isSavePoint = this.connection.inTransaction;
            await this.connection.startTransaction(isolationLevel);
            if (Diagnostic.enabled) {
                Diagnostic.debug(this.connection, isSavePoint ? "Set transaction save point" : "Start transaction");
            }
            await transactionBody();
        }
        catch (e) {
            error = e;
            if (Diagnostic.enabled) {
                Diagnostic.error(this.connection, e instanceof Error ? e.message : "Error", e);
            }
        }
        finally {
            if (!error) {
                await this.connection.commitTransaction();
                if (Diagnostic.enabled) {
                    Diagnostic.debug(this.connection, isSavePoint ? "commit transaction save point" : "Commit transaction");
                }
            }
            else {
                await this.connection.rollbackTransaction();
                if (Diagnostic.enabled) {
                    Diagnostic.debug(this.connection, isSavePoint ? "rollback transaction save point" : "rollback transaction");
                }
            }
            if (!isSavePoint) {
                await this.closeConnection();
            }
        }
        if (error) {
            throw error;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGF0YS9EYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzNDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBS2xGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU1sRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQVluRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUdoQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzVDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzVELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDNUQsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUU5RCxNQUFNLE9BQWdCLFNBQVM7SUFDM0IsSUFBVyxpQkFBaUI7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6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