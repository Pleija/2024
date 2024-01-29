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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBKb2luUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9Hcm91cEpvaW5RdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDeEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBTyxrQkFBK0MsU0FBUSxTQUFZO0lBQzVFLElBQWMsUUFBUTtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQVUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuSSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFjLFFBQVEsQ0FBQyxLQUFLO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFjLGNBQWM7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNJLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztJQUNELElBQWMsY0FBYyxDQUFDLEtBQUs7UUFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQUNELFlBQTRCLE1BQW9CLEVBQXFCLE9BQXNCLEVBQUUsWUFBNkUsRUFBRSxjQUF1RSxFQUFTLE9BQXVCLE1BQWE7UUFDNVIsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQURJLFdBQU0sR0FBTixNQUFNLENBQWM7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFpSyxTQUFJLEdBQUosSUFBSSxDQUFnQztRQUU1UixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEMsSUFBSSxZQUFZLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztRQUNqQyxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ25DLENBQUM7UUFFRCxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLElBQUksY0FBYyxZQUFZLGtCQUFrQixFQUFFLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3pDLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO1lBQzNDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUtNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF5QixDQUFDO1FBQzlFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEosTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNqRyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFRLENBQUM7SUFDOUQsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKIn0=