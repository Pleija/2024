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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxsRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0FsbERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQVExRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sZ0JBQW9CLFNBQVEsZ0JBQXlCO0lBQzlELElBQWMsU0FBUztRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBQ0QsSUFBYyxTQUFTLENBQUMsS0FBSztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBQ0QsWUFBWSxTQUF1QixFQUFFLFNBQStEO1FBQ2hHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQixJQUFJLFNBQVMsWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQy9CLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7UUFDakMsQ0FBQztJQUNMLENBQUM7SUFHUyxlQUFlO1FBQ3JCLE9BQU8sQ0FBQyxNQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDbEUsQ0FBQztJQUNTLFVBQVUsQ0FBQyxPQUFzQjtRQUN2QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQWdDLENBQUM7UUFDeEYsYUFBYSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMxRixNQUFNLEtBQUssR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzVGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQVEsQ0FBQztJQUN6RCxDQUFDO0lBQ1MsZ0JBQWdCO1FBQ3RCLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNKIn0=