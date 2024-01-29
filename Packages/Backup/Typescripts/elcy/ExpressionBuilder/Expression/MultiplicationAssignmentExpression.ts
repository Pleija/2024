import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { IBinaryOperatorExpression } from "./IBinaryOperatorExpression";
import { IExpression } from "./IExpression";
import { ParameterExpression } from "./ParameterExpression";
export class MultiplicationAssignmentExpression implements IBinaryOperatorExpression<number> {
    constructor(public leftOperand: ParameterExpression<number>, public rightOperand: IExpression<number>) { }
    public type = Number;
    public clone(replaceMap?: Map<IExpression, IExpression>) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new MultiplicationAssignmentExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    public hashCode() {
        return hashCodeAdd(hashCode("*=", this.leftOperand.hashCode()), this.rightOperand.hashCode());
    }
    public toString(): string {
        return "(" + this.leftOperand.toString() + " *= " + this.rightOperand.toString() + ")";
    }
}
