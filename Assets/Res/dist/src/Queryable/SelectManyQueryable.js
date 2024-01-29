import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class SelectManyQueryable extends Queryable {
    get selector() {
        if (!this._selector && this.selectorFn) {
            this._selector = ExpressionBuilder.parse(this.selectorFn, [this.parent.type], this.stackTree.node);
        }
        return this._selector;
    }
    set selector(value) {
        this._selector = value;
    }
    constructor(parent, selector, type = Object) {
        super(type, parent);
        this.parent = parent;
        this.type = type;
        if (selector instanceof FunctionExpression) {
            this.selector = selector;
        }
        else {
            this.selectorFn = selector;
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "selectMany", [this.selector.clone()]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam);
        result.parentRelation = null;
        return result;
    }
    hashCode() {
        return hashCodeAdd(hashCode("SELECTMANY", this.parent.hashCode()), this.selector.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0TWFueVF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9TZWxlY3RNYW55UXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzVGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl4QyxNQUFNLE9BQU8sbUJBQTBCLFNBQVEsU0FBWTtJQUN2RCxJQUFjLFFBQVE7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFxQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNILENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUNELElBQWMsUUFBUSxDQUFDLEtBQUs7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUNELFlBQTRCLE1BQW9CLEVBQUUsUUFBb0YsRUFBUyxPQUF1QixNQUFNO1FBQ3hLLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFESSxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQStGLFNBQUksR0FBSixJQUFJLENBQXlCO1FBRXhLLElBQUksUUFBUSxZQUFZLGtCQUFrQixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RyxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ2pHLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFxQixDQUFDO1FBQy9FLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzdCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7Q0FDSiJ9