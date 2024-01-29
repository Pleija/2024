import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class GroupJoinQueryable extends Queryable {
    get relation() {
        if (!this._relation && this.relationFn) {
            this._relation = ExpressionBuilder.parse(this.relationFn, [this.parent.type, this.parent2.type], this.stackTree.node);
        }
        return this._relation;
    }
    set relation(value) {
        this._relation = value;
    }
    get resultSelector() {
        if (!this._resultSelector && this.resultSelectorFn) {
            this._resultSelector = ExpressionBuilder.parse(this.resultSelectorFn, [this.parent.type, this.parent2.type], this.stackTree.node);
        }
        return this._resultSelector;
    }
    set resultSelector(value) {
        this._resultSelector = value;
    }
    constructor(parent, parent2, relationShip, resultSelector, type = Object) {
        super(type, parent);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
        this.option(this.parent2.queryOption);
        if (relationShip instanceof FunctionExpression) {
            this.relation = relationShip;
        }
        else {
            this.relationFn = relationShip;
        }
        if (resultSelector) {
            if (resultSelector instanceof FunctionExpression) {
                this.resultSelector = resultSelector;
            }
            else {
                this.resultSelectorFn = resultSelector;
            }
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const childOperand = this.parent2.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "groupJoin", [childOperand, this.relation.clone(), this.resultSelector.clone()]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        return hashCodeAdd(hashCode("GROUPJOIN", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBKb2luUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL0dyb3VwSm9pblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUN4RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3ZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJeEMsTUFBTSxPQUFPLGtCQUErQyxTQUFRLFNBQVk7SUFDNUUsSUFBYyxRQUFRO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBVSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25JLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUNELElBQWMsUUFBUSxDQUFDLEtBQUs7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQWMsY0FBYztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsZUFBZSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0ksQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsSUFBYyxjQUFjLENBQUMsS0FBSztRQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztJQUNqQyxDQUFDO0lBQ0QsWUFBNEIsTUFBb0IsRUFBcUIsT0FBc0IsRUFBRSxZQUE2RSxFQUFFLGNBQXVFLEVBQVMsT0FBdUIsTUFBYTtRQUM1UixLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBREksV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQWlLLFNBQUksR0FBSixJQUFJLENBQWdDO1FBRTVSLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0QyxJQUFJLFlBQVksWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksY0FBYyxFQUFFLENBQUM7WUFDakIsSUFBSSxjQUFjLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDekMsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBS00sVUFBVSxDQUFDLE9BQXNCO1FBQ3BDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUM3RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXlCLENBQUM7UUFDOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsSixNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ2pHLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQVEsQ0FBQztJQUM5RCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvRixDQUFDO0NBQ0oifQ==