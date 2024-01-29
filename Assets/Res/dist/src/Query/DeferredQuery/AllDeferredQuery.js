import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class AllDeferredQuery extends DQLDeferredQuery {
    get predicate() {
        if (!this._predicate && this.predicateFn) {
            this._predicate = ExpressionBuilder.parse(this.predicateFn, [this.queryable.type], this.queryable.stackTree.node);
        }
        return this._predicate;
    }
    set predicate(value) {
        this._predicate = value;
    }
    constructor(queryable, predicate) {
        super(queryable);
        if (predicate instanceof FunctionExpression) {
            this.predicate = predicate;
        }
        else {
            this.predicateFn = predicate;
        }
    }
    getResultParser() {
        return (result) => !result.first().rows.any();
    }
    buildQuery(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        objectOperand.includes = [];
        const methodExpression = new MethodCallExpression(objectOperand, "all", [this.predicate]);
        const param = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("ALL", super.getQueryCacheKey()), this.predicate.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxsRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvQWxsRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUMzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUTFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxnQkFBb0IsU0FBUSxnQkFBeUI7SUFDOUQsSUFBYyxTQUFTO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0SCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFjLFNBQVMsQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzVCLENBQUM7SUFDRCxZQUFZLFNBQXVCLEVBQUUsU0FBK0Q7UUFDaEcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksU0FBUyxZQUFZLGtCQUFrQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDL0IsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQUdTLGVBQWU7UUFDckIsT0FBTyxDQUFDLE1BQXNCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNsRSxDQUFDO0lBQ1MsVUFBVSxDQUFDLE9BQXNCO1FBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBZ0MsQ0FBQztRQUN4RixhQUFhLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUM1QixNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sS0FBSyxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDNUYsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBUSxDQUFDO0lBQ3pELENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQ0oifQ==