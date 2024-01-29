import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { MethodCallExpression } from "./MethodCallExpression";
export class AdditionAssignmentExpression {
    constructor(leftOperand, rightOperand) {
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
        this.type = this.leftOperand.type;
        if (leftOperand.type === String) {
            this.rightOperand = this.convertToStringOperand(rightOperand);
        }
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new AdditionAssignmentExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCode("+=", this.leftOperand.hashCode()), this.rightOperand.hashCode());
    }
    toString() {
        return "(" + this.leftOperand.toString() + " += " + this.rightOperand.toString() + ")";
    }
    convertToStringOperand(operand) {
        if (operand.type !== String) {
            operand = new MethodCallExpression(operand, "toString", [], String);
        }
        return operand;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkaXRpb25Bc3NpZ25tZW50RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vQWRkaXRpb25Bc3NpZ25tZW50RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUd4RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUU5RCxNQUFNLE9BQU8sNEJBQTRCO0lBQ3JDLFlBQW1CLFdBQW1DLEVBQVMsWUFBNEI7UUFBeEUsZ0JBQVcsR0FBWCxXQUFXLENBQXdCO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQWdCO1FBQ3ZGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxXQUFXLENBQUMsSUFBVyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBUSxDQUFDO1FBQ3pFLENBQUM7SUFDTCxDQUFDO0lBR00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRCxNQUFNLEtBQUssR0FBRyxJQUFJLDRCQUE0QixDQUFJLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRCxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQzNGLENBQUM7SUFDUyxzQkFBc0IsQ0FBQyxPQUFvQjtRQUNqRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDMUIsT0FBTyxHQUFHLElBQUksb0JBQW9CLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSiJ9