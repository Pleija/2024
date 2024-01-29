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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRFFMRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0RRTERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFRckQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhELE1BQU0sT0FBZ0IsZ0JBQTBCLFNBQVEsYUFBZ0I7SUFDcEUsSUFBVyxPQUFPO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBMkMsQ0FBQztZQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWM7aUJBQ3pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ2hFLE9BQU8sRUFBRSxDQUFDO1lBRWYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFXLFFBQVE7UUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO0lBQ3BDLENBQUM7SUFDRCxJQUFjLFVBQVU7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxH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