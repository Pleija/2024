import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DeleteExpression } from "../../Queryable/QueryExpression/DeleteExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
// TODO: currently cache only work when query has same delete mode.
export class BulkDeleteDeferredQuery extends DMLDeferredQuery {
    constructor(queryable, mode) {
        super(queryable);
        this.mode = mode;
    }
    buildQueries(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        return [new DeleteExpression(objectOperand, this.mode)];
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("DELETE", super.getQueryCacheKey()), hashCode(this.mode));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVsa0RlbGV0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0J1bGtEZWxldGVEZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFJcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsbUVBQW1FO0FBQ25FLE1BQU0sT0FBTyx1QkFBMkIsU0FBUSxnQkFBbUI7SUFDL0QsWUFBWSxTQUF1QixFQUFxQixJQUFnQjtRQUNwRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFEbUMsU0FBSSxHQUFKLElBQUksQ0FBWTtJQUV4RSxDQUFDO0lBQ1MsWUFBWSxDQUFDLE9BQXNCO1FBQ3pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUNoRixPQUFPLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUNTLGdCQUFnQjtRQUN0QixPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FDSiJ9