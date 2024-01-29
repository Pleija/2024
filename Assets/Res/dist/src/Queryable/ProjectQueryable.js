import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class ProjectQueryable extends Queryable {
    get selectors() {
        if (!this._selectors && this.selectorsFn) {
            this._selectors = this.selectorsFn.select((o) => ExpressionBuilder.parse(o, [this.parent.type], this.stackTree.node)).toArray();
        }
        return this._selectors;
    }
    set selectors(value) {
        this._selectors = value;
    }
    constructor(parent, selectors) {
        super(parent.type, parent);
        this.parent = parent;
        if (selectors.length > 0 && selectors[0] instanceof FunctionExpression) {
            this.selectors = selectors;
        }
        else {
            this.selectorsFn = selectors;
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const selectors = this.selectors.map((o) => o.clone());
        const methodExpression = new MethodCallExpression(objectOperand, "project", selectors);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        return hashCodeAdd(hashCode("PROJECT", this.parent.hashCode()), this.selectors.sum((o) => o.hashCode()));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdFF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9Qcm9qZWN0UXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzVGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl4QyxNQUFNLE9BQU8sZ0JBQW9CLFNBQVEsU0FBWTtJQUNqRCxJQUFjLFNBQVM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwSSxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFjLFNBQVMsQ0FBQyxLQUFLO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzVCLENBQUM7SUFDRCxZQUE0QixNQUFvQixFQUFFLFNBQTJEO1FBQ3pHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBREgsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUU1QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3JFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBZ0IsQ0FBQztRQUN0QyxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBZ0IsQ0FBQztRQUN4QyxDQUFDO0lBQ0wsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDakcsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBUSxDQUFDO0lBQzlELENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0csQ0FBQztDQUNKIn0=