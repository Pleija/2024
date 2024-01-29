import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { Queryable } from "./Queryable";
export class JoinQueryable extends Queryable {
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
    constructor(joinType, parent, parent2, relation, resultSelector, type = Object) {
        super(type, parent);
        this.joinType = joinType;
        this.parent2 = parent2;
        this.type = type;
        this.option(this.parent2.queryOption);
        if (relation instanceof FunctionExpression) {
            this.relation = relation;
        }
        else {
            this.relationFn = relation;
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
        const stack = visitor.stack;
        const childOperand = this.parent2.buildQuery(visitor);
        objectOperand.parameterTree.childrens.push(childOperand.parameterTree);
        visitor.stack = stack;
        const type = this.joinType.toLowerCase() + "Join";
        const params = [childOperand];
        if (this.joinType !== "CROSS") {
            params.push(this.relation.clone());
        }
        params.push(this.resultSelector.clone());
        const methodExpression = new MethodCallExpression(objectOperand, type, params);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm9pblF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9Kb2luUXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRXhGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzVGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRzNFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJeEMsTUFBTSxPQUFnQixhQUEwQyxTQUFRLFNBQVk7SUFDaEYsSUFBVyxTQUFTO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNWLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUNoQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7YUFDekQsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQWMsUUFBUTtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQVUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElB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