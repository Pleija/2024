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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW55RGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvQW55RGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFRN0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLGdCQUFvQixTQUFRLGdCQUF5QjtJQUM5RCxZQUFZLFNBQXVCO1FBQy9CLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ1MsZUFBZTtRQUNyQixPQUFPLENBQUMsTUFBc0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNqRSxDQUFDO0lBQ1MsVUFBVSxDQUFDLE9BQXNCO1FBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBZ0MsQ0FBQztRQUN4RixhQUFhLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUM1QixNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RSxNQUFNLEtBQUssR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzVGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQVEsQ0FBQztJQUN6RCxDQUFDO0lBQ1MsZ0JBQWdCO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDSiJ9