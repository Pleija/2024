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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRE1MRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvRE1MRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBUXJELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLE9BQWdCLGdCQUEwQixTQUFRLGFBQXFCO0lBQ3pFLElBQVcsT0FBTztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTJDLENBQUM7WUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjO2lCQUN6QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNoRSxPQUFPLEVBQUUsQ0FBQztZQUVmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBVyxRQUFRO1FBQ2YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztJQUNwQyxDQUFDO0lBQ0QsSUFBYyxVQUFVO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENB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