import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { Diagnostic } from "../../Logger/Diagnostic";
import { DeferredQuery } from "./DeferredQuery";
export class DQLDeferredQuery extends DeferredQuery {
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
    hashCode() {
        if (!this._hashCode) {
            this._hashCode = this.getQueryCacheKey() + this.queries.selectMany((o) => Object.values(o.parameters)).select((o) => hashCode((o.value || "NULL").toString())).sum();
        }
        return this._hashCode;
    }
    resultParser(result, queries) {
        return this.queryCache.resultParser(result, queries, this.dbContext);
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
            const queryExp = this.buildQuery(visitor);
            if (Diagnostic.enabled) {
                Diagnostic.trace(this, `build query expression time: ${timer.lap()}ms`);
            }
            const templates = this.dbContext.queryBuilder.toQuery(queryExp, this.queryOption);
            queryCache = {
                queryTemplates: templates,
                resultParser: this.getResultParser(queryExp),
                entities: queryExp.getEffectedEntities()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRFFMRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvRFFMRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQVFyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxPQUFnQixnQkFBMEIsU0FBUSxhQUFnQjtJQUNwRSxJQUFXLE9BQU87UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUEyQyxDQUFDO1lBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYztpQkFDekMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDaEUsT0FBTyxFQUFFLENBQUM7WUFFZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUNELElBQVcsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUNELElBQWMsVUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdB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