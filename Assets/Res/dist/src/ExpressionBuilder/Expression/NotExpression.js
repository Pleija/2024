import { resolveClone } from "../../Helper/Util";
import { NotEqualExpression } from "./NotEqualExpression";
import { OrExpression } from "./OrExpression";
import { ValueExpression } from "./ValueExpression";
export class NotExpression {
    constructor(operand) {
        this.type = Boolean;
        this.operand = this.convertOperand(operand);
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const operand = resolveClone(this.operand, replaceMap);
        const clone = new NotExpression(operand);
        replaceMap.set(this, clone);
        return clone;
    }
    convertOperand(operand) {
        switch (operand.type) {
            case Number:
                return new OrExpression(new NotEqualExpression(operand, new ValueExpression(0)), new NotEqualExpression(operand, new ValueExpression(null)));
            case String:
                return new OrExpression(new NotEqualExpression(operand, new ValueExpression("")), new NotEqualExpression(operand, new ValueExpression(null)));
            case undefined:
            case null:
            case Boolean:
                return operand;
            default:
                return new NotEqualExpression(operand, new ValueExpression(null));
        }
    }
    hashCode() {
        return -this.operand.hashCode();
    }
    toString() {
        return "!" + this.operand.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vTm90RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxNQUFNLE9BQU8sYUFBYTtJQUN0QixZQUFZLE9BQW9CO1FBSXpCLFNBQUksR0FBRyxPQUFPLENBQUM7UUFIbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFHTSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxjQUFjLENBQUMsT0FBb0I7UUFDdEMsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsS0FBSyxNQUFNO2dCQUNQLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakosS0FBSyxNQUFNO2dCQUNQLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEosS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssT0FBTztnQkFDUixPQUFPLE9BQU8sQ0FBQztZQUNuQjtnQkFDSSxPQUFPLElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNMLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pDLENBQUM7Q0FDSiJ9