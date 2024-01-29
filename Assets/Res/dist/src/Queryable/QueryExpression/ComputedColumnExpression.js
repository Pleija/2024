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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW5FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9Db21wdXRlZENvbHVtbkV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJeEUsTUFBTSxPQUFPLHdCQUF3QjtJQUNqQyxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFXLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUNELElBQVcsSUFBSTtRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUNELFlBQW1CLE1BQTZCLEVBQVMsVUFBdUIsRUFBUyxZQUFzQixFQUFTLEtBQWM7UUFBbkgsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFhO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQVU7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFTO1FBUXRJOztXQUVHO1FBQ0ksZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFackIsSUFBSSxVQUFVLFlBQVksd0JBQXdCLEVBQUUsQ0FBQztZQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDNUMsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFPTSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksd0JBQXdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU87YUFDRixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtPQUNoQyxJQUFJLENBQUMsWUFBWTtHQUNyQixDQUFDO0lBQ0EsQ0FBQztDQUNKIn0=