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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlyc3REZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvRGVmZXJyZWRRdWVyeS9GaXJzdERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTlDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFRdkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLGtCQUFzQixTQUFRLGdCQUFtQjtJQUMxRCxZQUFZLFNBQXVCO1FBQy9CLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ1MsZUFBZSxDQUFDLFFBQTRCO1FBQ2xELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUYsT0FBTyxDQUFDLE1BQXNCLEVBQUUsT0FBTyxFQUFFLFNBQW9CLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xGLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkQsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUNTLFVBQVUsQ0FBQyxPQUFzQjtRQUN2QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQW1DLENBQUM7UUFDM0YsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUM1RixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDO0lBQ2xDLENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNKIn0=