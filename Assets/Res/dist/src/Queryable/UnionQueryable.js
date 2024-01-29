import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { hashCode } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class UnionQueryable extends Queryable {
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
    constructor(parent, parent2, isUnionAll = false) {
        super(parent.type, parent.parameter({ union: isUnionAll }));
        this.parent2 = parent2;
        this.isUnionAll = isUnionAll;
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const stack = visitor.stack;
        const childOperand = this.parent2.buildQuery(visitor);
        objectOperand.parameterTree.childrens.push(childOperand.parameterTree);
        visitor.stack = stack;
        const methodExpression = new MethodCallExpression(objectOperand, "union", [childOperand, new ParameterExpression("union", Boolean)]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam);
        return result;
    }
    hashCode() {
        return hashCode("UNION", this.parent.hashCode() + this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pb25RdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvVW5pb25RdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDMUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJeEMsTUFBTSxPQUFPLGNBQWtCLFNBQVEsU0FBWTtJQUMvQyxJQUFXLFNBQVM7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxNQUFNLEdBQUc7Z0JBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ2hDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQzthQUN6RCxDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ0QsWUFBWSxNQUFvQixFQUFxQixPQUFxQixFQUFrQixhQUFhLEtBQUs7UUFDMUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFEWCxZQUFPLEdBQVAsT0FBTyxDQUFjO1FBQWtCLGVBQVUsR0FBVixVQUFVLENBQVE7SUFFOUcsQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsYUFBYSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUV0QixNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckksTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNqRyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBb0IsQ0FBQztRQUM5RSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBQ0oifQ==