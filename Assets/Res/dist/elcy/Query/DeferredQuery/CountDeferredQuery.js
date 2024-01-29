import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class CountDeferredQuery extends DQLDeferredQuery {
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
        const methodExpression = new MethodCallExpression(commandQuery, "count", []);
        const param = { selectExpression: commandQuery, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCode("COUNT", super.getQueryCacheKey());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291bnREZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L0RlZmVycmVkUXVlcnkvQ291bnREZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQVE3QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsZ0JBQXdCO0lBQzVELFlBQVksU0FBb0I7UUFDNUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFDUyxlQUFlLENBQUMsUUFBaUM7UUFDdkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRixPQUFPLENBQUMsTUFBc0IsRUFBRSxPQUFPLEVBQUUsU0FBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUcsQ0FBQztJQUNTLFVBQVUsQ0FBQyxPQUFzQjtRQUN2QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQWdDLENBQUM7UUFDdkYsWUFBWSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0UsTUFBTSxLQUFLLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUMzRixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFvQixDQUFDO0lBQ3JFLENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNKIn0=