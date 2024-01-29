import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class ExceptQueryable extends Queryable {
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
        const methodExpression = new MethodCallExpression(objectOperand, "except", [childOperand]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam);
        return result;
    }
    hashCode() {
        return hashCodeAdd(hashCode("EXCLUDE", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhjZXB0UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9FeGNlcHRRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBTyxlQUFtQixTQUFRLFNBQVk7SUFDaEQsSUFBVyxTQUFTO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNWLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUNoQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7YUFDekQsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELFlBQTRCLE1BQW9CLEVBQXFCLE9BQXFCO1FBQ3RGLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBREgsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFjO0lBRTFGLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBc0I7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDNUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFdEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzNGLE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDakcsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQW9CLENBQUM7UUFDOUUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNKIn0=