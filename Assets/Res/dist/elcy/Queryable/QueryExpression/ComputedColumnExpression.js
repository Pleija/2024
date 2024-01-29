import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
export class ComputedColumnExpression {
    get columnName() {
        return this.propertyName;
    }
    get dataPropertyName() {
        return this.alias;
    }
    get type() {
        return this.expression.type;
    }
    constructor(entity, expression, propertyName, alias) {
        this.entity = entity;
        this.expression = expression;
        this.propertyName = propertyName;
        this.alias = alias;
        /**
         * Determined whether column has been declared in select statement.
         */
        this.isDeclared = false;
        this.isNullable = true;
        this.isPrimary = false;
        if (expression instanceof ComputedColumnExpression) {
            this.expression = expression.expression;
        }
        if (!this.alias) {
            this.alias = this.propertyName;
        }
    }
    clone(replaceMap) {
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
    hashCode() {
        return hashCode(this.propertyName, hashCodeAdd(this.entity.hashCode(), this.expression.hashCode()));
    }
    toString() {
        return `ComputedColum({
Expression:${this.expression.toString()},
Name:${this.propertyName}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW5FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vQ29tcHV0ZWRDb2x1bW5FeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSXhFLE1BQU0sT0FBTyx3QkFBd0I7SUFDakMsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBVyxnQkFBZ0I7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFXLElBQUk7UUFDWCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxZQUFtQixNQUE2QixFQUFTLFVBQXVCLEVBQVMsWUFBc0IsRUFBUyxLQUFjO1FBQW5ILFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFVO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUztRQVF0STs7V0FFRztRQUNJLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsZUFBVSxHQUFHLElBQUksQ0FBQztRQUNsQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBWnJCLElBQUksVUFBVSxZQUFZLHdCQUF3QixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBT00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRCxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEcsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPO2FBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7T0FDaEMsSUFBSSxDQUFDLFlBQVk7R0FDckIsQ0FBQztJQUNBLENBQUM7Q0FDSiJ9