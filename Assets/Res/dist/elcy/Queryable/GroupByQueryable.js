import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class GroupByQueryable extends Queryable {
    get keySelector() {
        if (!this._keySelector && this.keySelectorFn) {
            this._keySelector = ExpressionBuilder.parse(this.keySelectorFn, [this.parent.type], this.stackTree.node);
        }
        return this._keySelector;
    }
    set keySelector(value) {
        this._keySelector = value;
    }
    constructor(parent, keySelector) {
        super(Array, parent);
        this.parent = parent;
        if (keySelector instanceof FunctionExpression) {
            this.keySelector = keySelector;
        }
        else {
            this.keySelectorFn = keySelector;
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "groupBy", [this.keySelector.clone()]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        const result = visitor.visit(methodExpression, visitParam);
        result.parentRelation = null;
        return result;
    }
    hashCode() {
        return hashCodeAdd(hashCode("GROUPBY", this.parent.hashCode()), this.keySelector ? this.keySelector.hashCode() : 0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBCeVF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvR3JvdXBCeVF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUN4RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3ZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJeEMsTUFBTSxPQUFPLGdCQUF1QixTQUFRLFNBQWtDO0lBQzFFLElBQWMsV0FBVztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFjLFdBQVcsQ0FBQyxLQUFLO1FBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFDRCxZQUE0QixNQUFvQixFQUFFLFdBQXFEO1FBQ25HLEtBQUssQ0FBQyxLQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFESixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBRTVDLElBQUksV0FBVyxZQUFZLGtCQUFrQixFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDbkMsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztRQUNyQyxDQUFDO0lBQ0wsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RyxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ2pHLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFxQixDQUFDO1FBQy9FLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzdCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEgsQ0FBQztDQUNKIn0=