import { GenericType } from "../../Common/Type";
import { IExpression } from "../../ExpressionBuilder/Expression/IExpression";
import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { IColumnExpression } from "./IColumnExpression";
import { IEntityExpression } from "./IEntityExpression";

export class ComputedColumnExpression<TE = any, T = any> implements IColumnExpression<TE, T> {
    public get columnName() {
        return this.propertyName;
    }
    public get dataPropertyName() {
        return this.alias;
    }
    public get type(): GenericType<T> {
        return this.expression.type;
    }
    constructor(public entity: IEntityExpression<TE>, public expression: IExpression, public propertyName: keyof TE, public alias?: string) {
        if (expression instanceof ComputedColumnExpression) {
            this.expression = expression.expression;
        }
        if (!this.alias) {
            this.alias = this.propertyName;
        }
    }
    /**
     * Determined whether column has been declared in select statement.
     */
    public isDeclared = false;
    public isNullable = true;
    public isPrimary = false;
    public clone(replaceMap?: Map<IExpression, IExpression>) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const entity = resolveClone(this.entity, replaceMap);
        const exp = resolveClone(this.expression, replaceMap);
        const clone = new ComputedColumnExpression(entity, exp, this.propertyName, this.alias);
        replaceMap.set(this, clone);
        clone.isPrimary = this.isPrimary;
        clone.isNullable = this.isNullable;
        return clone;
    }
    public hashCode() {
        return hashCode(this.propertyName, hashCodeAdd(this.entity.hashCode(), this.expression.hashCode()));
    }
    public toString(): string {
        return `ComputedColum({
Expression:${this.expression.toString()},
Name:${this.propertyName}
})`;
    }
}
