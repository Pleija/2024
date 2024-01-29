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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm9pblF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvSm9pblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUV4RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUczRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBZ0IsYUFBMEMsU0FBUSxTQUFZO0lBQ2hGLElBQVcsU0FBUztRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRztnQkFDVixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSTtnQkFDaEMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO2FBQ3pELENBQUM7WUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFjLFFBQVE7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJ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