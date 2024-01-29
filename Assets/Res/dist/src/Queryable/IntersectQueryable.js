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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJzZWN0UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL0ludGVyc2VjdFF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl4QyxNQUFNLE9BQU8sa0JBQXNCLFNBQVEsU0FBWTtJQUNuRCxJQUFXLFNBQVM7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxNQUFNLEdBQUc7Z0JBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ2hDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQzthQUN6RCxDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ0QsWUFBNEIsTUFBb0IsRUFBcUIsT0FBcUI7UUFDdEYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFESCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWM7SUFFMUYsQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsYUFBYSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUV0QixNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDOUYsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNqRyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFRLENBQUM7SUFDOUQsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDbkYsQ0FBQztDQUNKIn0=