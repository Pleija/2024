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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL05vdEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR2pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsTUFBTSxPQUFPLGFBQWE7SUFDdEIsWUFBWSxPQUFvQjtRQUl6QixTQUFJLEdBQUcsT0FBTyxDQUFDO1FBSGxCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sY0FBYyxDQUFDLE9BQW9CO1FBQ3RDLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25CLEtBQUssTUFBTTtnQkFDUCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pKLEtBQUssTUFBTTtnQkFDUCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xKLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxPQUFPLENBQUM7WUFDbkI7Z0JBQ0ksT0FBTyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7SUFDTCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0NBQ0oifQ==