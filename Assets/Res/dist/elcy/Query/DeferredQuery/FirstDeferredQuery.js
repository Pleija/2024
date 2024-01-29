import { QueryType } from "../../Common/Enum";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { hasFlags, hashCode } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class FirstDeferredQuery extends DQLDeferredQuery {
    constructor(queryable) {
        super(queryable);
    }
    getResultParser(queryExp) {
        const parser = this.dbContext.getQueryResultParser(queryExp, this.dbContext.queryBuilder);
        return (result, queries, dbContext) => {
            let i = 0;
            result = result.where(() => hasFlags(queries[i++].type, QueryType.DQL)).toArray();
            return parser.parse(result, dbContext).first();
        };
    }
    buildQuery(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "first", []);
        const param = { selectExpression: objectOperand, scope: "queryable" };
        visitor.visit(methodExpression, param);
        return param.selectExpression;
    }
    getQueryCacheKey() {
        return hashCode("FIRST", super.getQueryCacheKey());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlyc3REZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L0RlZmVycmVkUXVlcnkvRmlyc3REZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUXZELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxrQkFBc0IsU0FBUSxnQkFBbUI7SUFDMUQsWUFBWSxTQUF1QjtRQUMvQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNTLGVBQWUsQ0FBQyxRQUE0QjtRQUNsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFGLE9BQU8sQ0FBQyxNQUFzQixFQUFFLE9BQU8sRUFBRSxTQUFvQixFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsRixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25ELENBQUMsQ0FBQztJQUNOLENBQUM7SUFDUyxVQUFVLENBQUMsT0FBc0I7UUFDdkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFtQyxDQUFDO1FBQzNGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sS0FBSyxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDNUYsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztJQUNsQyxDQUFDO0lBQ1MsZ0JBQWdCO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSiJ9