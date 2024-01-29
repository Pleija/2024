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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9TZWxlY3RRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFeEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl4QyxNQUFNLE9BQU8sZUFBc0IsU0FBUSxTQUFZO0lBQ25ELElBQWMsUUFBUTtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsSUFBSSxJQUFJLENBQUMsVUFBVSxZQUFZLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZHLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxVQUFpQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBbUIsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQW1CLENBQUMsQ0FBQztZQUM3SixDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBQ0QsSUFBYyxRQUFRLENBQUMsS0FBSztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBQ0QsWUFBNEIsTUFBb0IsRUFBRSxRQUE4QixFQUFTLE9BQXVCLE1BQU07UUFDbEgsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQURJLFdBQU0sR0FBTixNQUFNLENBQWM7UUFBeUMsU0FBSSxHQUFKLElBQUksQ0FBeUI7UUFFbEgsSUFBSSxRQUFRLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBR00sVUFBVSxDQUFDLE9BQXNCO1FBQ3BDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUM3RSxNQUFNLE1BQU0sR0FBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25GLE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDakcsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQXFCLENBQUM7UUFDL0UsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDN0IsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNKIn0=