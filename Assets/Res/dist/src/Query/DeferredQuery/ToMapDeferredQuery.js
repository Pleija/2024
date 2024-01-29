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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9NYXBEZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvRGVmZXJyZWRRdWVyeS9Ub01hcERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTlDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFTMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLGtCQUE0QixTQUFRLGdCQUEyQjtJQUN4RSxJQUFjLGFBQWE7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFDRCxJQUFjLGFBQWEsQ0FBQyxLQUFLO1FBQzdCLElB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