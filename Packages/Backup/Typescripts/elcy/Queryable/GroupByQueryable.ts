import { GroupedEnumerable } from "../Enumerable/GroupedEnumerable";
import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { IQueryVisitor } from "../Query/IQueryVisitor";
import { IQueryVisitParameter } from "../Query/IQueryVisitParameter";
import { Queryable } from "./Queryable";
import { QueryExpression } from "./QueryExpression/QueryExpression";
import { SelectExpression } from "./QueryExpression/SelectExpression";

export class GroupByQueryable<K, T> extends Queryable<GroupedEnumerable<K, T>> {
    protected get keySelector() {
        if (!this._keySelector && this.keySelectorFn) {
            this._keySelector = ExpressionBuilder.parse(this.keySelectorFn, [this.parent.type], this.stackTree.node);
        }
        return this._keySelector;
    }
    protected set keySelector(value) {
        this._keySelector = value;
    }
    constructor(public readonly parent: Queryable<T>, keySelector: FunctionExpression<K> | ((item: T) => K)) {
        super(Array as any, parent);
        if (keySelector instanceof FunctionExpression) {
            this.keySelector = keySelector;
        }
        else {
            this.keySelectorFn = keySelector;
        }
    }
    protected readonly keySelectorFn: (item: T) => K;
    private _keySelector: FunctionExpression;
    public buildQuery(visitor: IQueryVisitor): QueryExpression<Array<GroupedEnumerable<K, T>>> {
        const objectOperand = this.parent.buildQuery(visitor) as SelectExpression<T>;
        const methodExpression = new MethodCallExpression(objectOperand, "groupBy", [this.keySelector.clone()]);
        const visitParam: IQueryVisitParameter = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam) as SelectExpression;
        result.parentRelation = null;
        return result;
    }
    public hashCode() {
        return hashCodeAdd(hashCode("GROUPBY", this.parent.hashCode()), this.keySelector ? this.keySelector.hashCode() : 0);
    }
}
