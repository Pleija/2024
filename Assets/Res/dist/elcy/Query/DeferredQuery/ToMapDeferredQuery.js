import { QueryType } from "../../Common/Enum";
import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { ObjectValueExpression } from "../../ExpressionBuilder/Expression/ObjectValueExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DQLDeferredQuery } from "./DQLDeferredQuery";
export class ToMapDeferredQuery extends DQLDeferredQuery {
    get valueSelector() {
        if (!this._valueSelector && this._valueSelectorFn) {
            this._valueSelector = ExpressionBuilder.parse(this._valueSelectorFn, [this.queryable.type], this.queryable.stackTree.node);
        }
        return this._valueSelector;
    }
    set valueSelector(value) {
        this._valueSelector = value;
    }
    get keySelector() {
        if (!this._keySelector && this._keySelectorFn) {
            this._keySelector = ExpressionBuilder.parse(this._keySelectorFn, [this.queryable.type], this.queryable.stackTree.node);
        }
        return this._keySelector;
    }
    set keySelector(value) {
        this._keySelector = value;
    }
    constructor(queryable, keySelector, valueSelector) {
        super(queryable);
        if (keySelector instanceof FunctionExpression) {
            this.keySelector = keySelector;
        }
        else {
            this._keySelectorFn = keySelector;
        }
        if (valueSelector instanceof FunctionExpression) {
            this.valueSelector = valueSelector;
        }
        else {
            this._valueSelectorFn = valueSelector;
        }
    }
    getResultParser(queryExp) {
        const parser = this.dbContext.getQueryResultParser(queryExp, this.dbContext.queryBuilder);
        return (result, queries, dbContext) => {
            let i = 0;
            result = result.where(() => queries[i++].type === QueryType.DQL).toArray();
            return parser.parse(result, dbContext).toMap((o) => o.Key, (o) => o.Value);
        };
    }
    buildQuery(visitor) {
        const commandQuery = this.queryable.buildQuery(visitor);
        const paramExp = new ParameterExpression("m");
        const selector = new ObjectValueExpression({});
        const keyExp = this.keySelector;
        const valueExp = this.valueSelector;
        keyExp.params[0].name = valueExp.params[0].name = paramExp.name;
        selector.object.Key = keyExp.body;
        selector.object.Value = valueExp.body;
        const selectorExp = new FunctionExpression(selector, [paramExp]);
        const methodExpression = new MethodCallExpression(commandQuery, "select", [selectorExp]);
        const param = { selectExpression: commandQuery, scope: "queryable" };
        return visitor.visit(methodExpression, param);
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("MAP", super.getQueryCacheKey()), hashCodeAdd(this.keySelector.hashCode(), this.valueSelector.hashCode()));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9NYXBEZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L0RlZmVycmVkUXVlcnkvVG9NYXBEZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUMzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxrQkFBNEIsU0FBUSxnQkFBMkI7SUFDeEUsSUFBYyxhQUFhO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxjQUFjLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0gsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBYyxhQUFhLENBQUMsS0FBSztRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUNoQyxDQUFDO0lBQ0QsSUFBYyxXQUFXO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFjLFdBQVcsQ0FBQyxLQUFLO1FBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFDRCxZQUFZLFNBQXVCLEVBQ3ZCLFdBQXFELEVBQ3JELGFBQXVEO1FBQy9ELEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQixJQUFJLFdBQVcsWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ25DLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsR0FBRyxXQUFXLENBQUM7UUFDdEMsQ0FBQztRQUNELElBQUksYUFBYSxZQUFZLGtCQUFrQixFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDdkMsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO1FBQzFDLENBQUM7SUFDTCxDQUFDO0lBS1MsZUFBZSxDQUFDLFFBQTRCO1FBQ2xELE1BQU0sTUFBTSxHQUE2QyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BJLE9BQU8sQ0FBQyxNQUFzQixFQUFFLE9BQU8sRUFBRSxTQUFvQixFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQztJQUNOLENBQUM7SUFDUyxVQUFVLENBQUMsT0FBc0I7UUFDdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFtQyxDQUFDO1FBRTFGLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBcUIsQ0FBdUIsRUFBRSxDQUFDLENBQUM7UUFDckUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDaEUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNsQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRSxNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDekYsTUFBTSxLQUFLLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUMzRixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUEwQyxDQUFDO0lBQzNGLENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNJLENBQUM7Q0FDSiJ9