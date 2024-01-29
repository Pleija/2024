import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class AvgDeferredQuery extends DQLDeferredQuery {
    constructor(queryable) {
        super(queryable);
    }
    getResultParser(queryExp) {
        const parser = this.dbContext.getQueryResultParser(queryExp, this.dbContext.queryBuilder);
        return (result, queries, dbContext) => parser.parse(result, dbContext).first();
    }
    buildQuery(visitor) {
        const commandQuery = this.queryable.buildQuery(visitor);
        commandQuery.includes = [];
        const methodExpression = new MethodCallExpression(commandQuery, "avg", []);
        const param = { selectExpression: commandQuery, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCode("AVG", super.getQueryCacheKey());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZnRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0F2Z0RlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUTdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxnQkFBd0I7SUFDMUQsWUFBWSxTQUE0QjtRQUNwQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNTLGVBQWUsQ0FBQyxRQUFpQztRQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFGLE9BQU8sQ0FBQyxNQUFzQixFQUFFLE9BQU8sRUFBRSxTQUFvQixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM5RyxDQUFDO0lBQ1MsVUFBVSxDQUFDLE9BQXNCO1FBQ3ZDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBZ0MsQ0FBQztRQUN2RixZQUFZLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUMzQixNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxNQUFNLEtBQUssR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzNGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQW9CLENBQUM7SUFDckUsQ0FBQztJQUNTLGdCQUFnQjtRQUN0QixPQUFPLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0oifQ==