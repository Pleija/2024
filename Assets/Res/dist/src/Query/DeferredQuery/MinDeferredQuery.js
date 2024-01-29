import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class MinDeferredQuery extends DQLDeferredQuery {
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
        const methodExpression = new MethodCallExpression(commandQuery, "min", []);
        const param = { selectExpression: commandQuery, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCode("MIN", super.getQueryCacheKey());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvTWluRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFRN0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGdCQUF3QjtJQUMxRCxZQUFZLFNBQTRCO1FBQ3BDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ1MsZUFBZSxDQUFDLFFBQWlDO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUYsT0FBTyxDQUFDLE1BQXNCLEVBQUUsT0FBTyxFQUFFLFNBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzlHLENBQUM7SUFDUyxVQUFVLENBQUMsT0FBc0I7UUFDdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFnQyxDQUFDO1FBQ3ZGLFlBQVksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQzNCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sS0FBSyxHQUF5QixFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDM0YsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBb0IsQ0FBQztJQUNyRSxDQUFDO0lBQ1MsZ0JBQWdCO1FBQ3RCLE9BQU8sUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDSiJ9