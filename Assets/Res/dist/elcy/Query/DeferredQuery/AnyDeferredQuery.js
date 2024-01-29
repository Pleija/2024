import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class AnyDeferredQuery extends DQLDeferredQuery {
    constructor(queryable) {
        super(queryable);
    }
    getResultParser() {
        return (result) => result.first().rows.any();
    }
    buildQuery(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        objectOperand.includes = [];
        const methodExpression = new MethodCallExpression(objectOperand, "any", []);
        const param = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCode("ANY", super.getQueryCacheKey());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW55RGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0FueURlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUTdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxnQkFBb0IsU0FBUSxnQkFBeUI7SUFDOUQsWUFBWSxTQUF1QjtRQUMvQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNTLGVBQWU7UUFDckIsT0FBTyxDQUFDLE1BQXNCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDakUsQ0FBQztJQUNTLFVBQVUsQ0FBQyxPQUFzQjtRQUN2QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQWdDLENBQUM7UUFDeEYsYUFBYSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsTUFBTSxLQUFLLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUM1RixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFRLENBQUM7SUFDekQsQ0FBQztJQUNTLGdCQUFnQjtRQUN0QixPQUFPLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0oifQ==