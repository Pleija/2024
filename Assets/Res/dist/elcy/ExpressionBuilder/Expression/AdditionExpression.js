import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { MethodCallExpression } from "./MethodCallExpression";
export class AdditionExpression {
    constructor(leftOperand, rightOperand) {
        if (leftOperand.type === String || rightOperand.type === String) {
            this.type = String;
            this.leftOperand = this.convertToStringOperand(leftOperand);
            this.rightOperand = this.convertToStringOperand(rightOperand);
        }
        else {
            this.leftOperand = leftOperand;
            this.rightOperand = rightOperand;
            this.type = Number;
        }
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new AdditionExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    convertToStringOperand(operand) {
        if (operand.type !== String) {
            operand = new MethodCallExpression(operand, "toString", [], String);
        }
        return operand;
    }
    hashCode() {
        if (this.type === Number) {
            return hashCode("+", this.leftOperand.hashCode()) + hashCode("+", this.rightOperand.hashCode());
        }
        return hashCodeAdd(hashCode("+", this.leftOperand.hashCode()), this.rightOperand.hashCode());
    }
    toString() {
        return "(" + this.leftOperand.toString() + " + " + this.rightOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkaXRpb25FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vQWRkaXRpb25FeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR3hFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTlELE1BQU0sT0FBTyxrQkFBa0I7SUFDM0IsWUFBWSxXQUF3QixFQUFFLFlBQXlCO1FBQzNELElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUM5RCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQWEsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQVEsQ0FBQztZQUNuRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQVEsQ0FBQztRQUN6RSxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBYSxDQUFDO1FBQzlCLENBQUM7SUFDTCxDQUFDO0lBS00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRCxNQUFNLEtBQUssR0FBRyxJQUFJLGtCQUFrQixDQUFJLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sc0JBQXNCLENBQUMsT0FBb0I7UUFDOUMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQzFCLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDRCxPQUFPLE9BQWMsQ0FBQztJQUMxQixDQUFDO0lBQ00sUUFBUTtRQUNYLElBQUksSUFBSSxDQUFDLElBQW1CLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDdEMsT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBQ0QsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDMUYsQ0FBQztDQUNKIn0=