import { hashCodeAdd } from "../../Helper/Util";
import { Diagnostic } from "../../Logger/Diagnostic";
import { DeferredQuery } from "./DeferredQuery";
export class DMLDeferredQuery extends DeferredQuery {
    get queries() {
        if (!this._queries) {
            const tvpMap = new Map();
            const queries = this.queryCache.queryTemplates
                .select((o) => this.toQuery(o, this.queryable.stackTree, tvpMap))
                .toArray();
            this._queries = this.tvpQueries(tvpMap, queries);
        }
        return this._queries;
    }
    get entities() {
        return this.queryCache.entities;
    }
    get queryCache() {
        if (!this._queryCache) {
            this._queryCache = this.getQueryCache();
        }
        return this._queryCache;
    }
    get queryCacheKey() {
        if (!this._queryCacheKey) {
            const timer = Diagnostic.timer();
            this._queryCacheKey = this.getQueryCacheKey();
            if (Diagnostic.enabled) {
                Diagnostic.trace(this, `cache key: ${this._queryCacheKey}. build cache key time: ${timer.lap()}ms`);
            }
        }
        return this._queryCacheKey;
    }
    constructor(queryable) {
        super(queryable.dbContext, queryable.queryOption);
        this.queryable = queryable;
    }
    // No Result Cache
    hashCode() {
        return 0;
    }
    resultParser(result) {
        return result.sum((o) => o.effectedRows);
    }
    getQueryCache() {
        let queryCache;
        const timer = Diagnostic.timer();
        const cacheManager = this.dbContext.queryCacheManager;
        if (!this.queryOption.noQueryCache && cacheManager && this.queryCacheKey) {
            queryCache = cacheManager.get(this.queryCacheKey);
            if (Diagnostic.enabled) {
                Diagnostic.debug(this, `find query expression cache with key: ${this.queryCacheKey}. cache exist: ${!!queryCache}`);
                Diagnostic.trace(this, `find query expression cache time: ${timer.lap()}ms`);
            }
        }
        if (!queryCache) {
            const visitor = this.dbContext.queryVisitor;
            visitor.queryOption = this.queryOption;
            const queryExps = this.buildQueries(visitor);
            if (Diagnostic.enabled) {
                Diagnostic.trace(this, `build query expression time: ${timer.lap()}ms`);
            }
            const templates = queryExps
                .selectMany((o) => this.dbContext.queryBuilder.toQuery(o, this.queryOption))
                .toArray();
            queryCache = {
                queryTemplates: templates,
                entities: queryExps.selectMany((o) => o.getEffectedEntities()).toArray()
            };
            if (!this.queryOption.noQueryCache && cacheManager) {
                cacheManager.set(this.queryCacheKey, queryCache);
            }
        }
        return queryCache;
    }
    getQueryCacheKey() {
        let cacheKey = this.queryable.hashCode();
        if (this.queryOption.includeSoftDeleted) {
            cacheKey = hashCodeAdd(cacheKey, 1);
        }
        return cacheKey;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRE1MRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0RNTERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQVFyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxPQUFnQixnQkFBMEIsU0FBUSxhQUFxQjtJQUN6RSxJQUFXLE9BQU87UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUEyQyxDQUFDO1lBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYztpQkFDekMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDaEUsT0FBTyxFQUFFLENBQUM7WUFFZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELElBQVcsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUNELElBQWMsVUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxD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