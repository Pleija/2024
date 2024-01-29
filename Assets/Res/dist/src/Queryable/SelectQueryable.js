import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ValueExpression } from "../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { toObjectFunctionExpression } from "../Helper/ExpressionUtil";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class SelectQueryable extends Queryable {
    get selector() {
        if (!this._selector && this.selectorFn) {
            if (this.selectorFn instanceof Function) {
                this._selector = ExpressionBuilder.parse(this.selectorFn, [this.parent.type], this.stackTree.node);
            }
            else {
                this._selector = toObjectFunctionExpression(this.selectorFn, this.parent.type, "o", this.stackTree.node, this.type);
            }
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
        const params = [this.selector.clone()];
        if (this.type !== Object) {
            params.unshift(new ValueExpression(this.type));
        }
        const methodExpression = new MethodCallExpression(objectOperand, "select", params);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam);
        result.parentRelation = null;
        return result;
    }
    hashCode() {
        return hashCodeAdd(hashCode("SELECT", this.parent.hashCode()), this.selector.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1NlbGVjdFF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUV4RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saURBQWlELENBQUM7QUFDbEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBTyxlQUFzQixTQUFRLFNBQVk7SUFDbkQsSUFBYyxRQUFRO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQyxJQUFJLElBQUksQ0FBQyxVQUFVLFlBQVksUUFBUSxFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkcsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFVBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFtQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBbUIsQ0FBQyxDQUFDO1lBQzdKLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFjLFFBQVEsQ0FBQyxLQUFLO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFDRCxZQUE0QixNQUFvQixFQUFFLFFBQThCLEVBQVMsT0FBdUIsTUFBTTtRQUNsSCxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBREksV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUF5QyxTQUFJLEdBQUosSUFBSSxDQUF5QjtRQUVsSCxJQUFJLFFBQVEsWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDL0IsQ0FBQztJQUNMLENBQUM7SUFHTSxVQUFVLENBQUMsT0FBc0I7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLE1BQU0sTUFBTSxHQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkYsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNqRyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBcUIsQ0FBQztRQUMvRSxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUM3QixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQ0oifQ==