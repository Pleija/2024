import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { IExpression } from "./IExpression";
import { IUnaryOperatorExpression } from "./IUnaryOperatorExpression";
export class NegationExpression implements IUnaryOperatorExpression<number> {
    constructor(public operand: IExpression<number>) { }
    public type = Number;
    public clone(replaceMap?: Map<IExpression, IExpression>) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const operand = resolveClone(this.operand, replaceMap);
        const clone = new NegationExpression(operand);
        replaceMap.set(this, clone);
        return clone;
    }
    public hashCode() {
        return hashCodeAdd(hashCode("-"), this.operand.hashCode());
    }
    public toString(): string {
        return "-" + this.operand.toString();
    }
}
