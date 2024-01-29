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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RhdGEvRGJDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUczQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUtsRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFNbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDM0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFZbkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHaEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUc1QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHaEQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUM1RCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzVELE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFOUQsTUFBTSxPQUFnQixTQUFTO0lBQzNCLElBQVcsaUJBQWlCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFD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