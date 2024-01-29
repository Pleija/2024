import { GenericType } from "../../Common/Type";
import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { IBinaryOperatorExpression } from "./IBinaryOperatorExpression";
import { IExpression } from "./IExpression";
import { MethodCallExpression } from "./MethodCallExpression";
import { ParameterExpression } from "./ParameterExpression";
export class AssignmentExpression<T = any> implements IBinaryOperatorExpression<T> {
    constructor(public leftOperand: ParameterExpression, public rightOperand: IExpression) {
        this.type = leftOperand.type;
        if (leftOperand.type === String) {
            this.rightOperand = this.convertToStringOperand(rightOperand) as any;
        }
    }
    public itemType?: GenericType<T>;
    public type: GenericType<T>;
    public clone(replaceMap?: Map<IExpression, IExpression>) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new AssignmentExpression<T>(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    public convertToStringOperand(operand: IExpression): IExpression<string> {
        if (operand.type !== String) {
            operand = new MethodCallExpression(operand, "toString", [], String);
        }
        return operand as any;
    }
    public hashCode() {
        return hashCodeAdd(hashCode("=", this.leftOperand.hashCode()), this.rightOperand.hashCode());
    }
    public toString(): string {
        return "(" + this.leftOperand.toString() + " = " + this.rightOperand.toString() + ")";
    }
}
