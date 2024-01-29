import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class IntersectQueryable extends Queryable {
    get stackTree() {
        if (!this._param) {
            this._param = {
                node: this.parent.stackTree.node,
                childrens: Array.from(this.parent.stackTree.childrens)
            };
            this._param.childrens.push(this.parent2.stackTree);
        }
        return this._param;
    }
    constructor(parent, parent2) {
        super(parent.type, parent);
        this.parent = parent;
        this.parent2 = parent2;
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const stack = visitor.stack;
        const childOperand = this.parent2.buildQuery(visitor);
        objectOperand.parameterTree.childrens.push(childOperand.parameterTree);
        visitor.stack = stack;
        const methodExpression = new MethodCallExpression(objectOperand, "intersect", [childOperand]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        return hashCode("INTERSECT", this.parent.hashCode() + this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJzZWN0UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9JbnRlcnNlY3RRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJeEMsTUFBTSxPQUFPLGtCQUFzQixTQUFRLFNBQVk7SUFDbkQsSUFBVyxTQUFTO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNWLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUNoQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7YUFDekQsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELFlBQTRCLE1BQW9CLEVBQXFCLE9BQXFCO1FBQ3RGLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBREgsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFjO0lBRTFGLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBc0I7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDNUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFdEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzlGLE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDakcsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBUSxDQUFDO0lBQzlELENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Q0FDSiJ9