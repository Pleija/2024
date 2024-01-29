import { ColumnGeneration } from "../../Common/Enum";
import { resolveTreeClone } from "../../Helper/ExpressionUtil";
import { hasFlags, hashCode, resolveClone } from "../../Helper/Util";
import { QueryExpression } from "./QueryExpression";
export class UpdateExpression extends QueryExpression {
    get entity() {
        return this.select.entity;
    }
    get joins() {
        return this.select.joins;
    }
    get orders() {
        return this.select.orders;
    }
    get paging() {
        return this.select.paging;
    }
    get type() {
        return undefined;
    }
    get where() {
        return this.select.where;
    }
    get generatedColumns() {
        if (!this._generatedColumns) {
            this._generatedColumns = this.returnGeneratedUpdate
                ? this.entity.columns.where((o) => hasFlags(o.columnMeta.generation, ColumnGeneration.Update)).toArray()
                : [];
        }
        return this._generatedColumns;
    }
    constructor(select, setter, returnGeneratedUpdate = false) {
        super();
        this.setter = setter;
        this.returnGeneratedUpdate = returnGeneratedUpdate;
        this.select = select;
        this.parameterTree = select.parameterTree;
        this.select.includes = [];
    }
    addJoin(child, relationMetaOrRelations, type) {
        return this.select.addJoin(child, relationMetaOrRelations, type);
    }
    addWhere(expression) {
        this.select.addWhere(expression);
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const select = resolveClone(this.select, replaceMap);
        const setter = {};
        for (const prop in this.setter) {
            setter[prop] = resolveClone(this.setter[prop], replaceMap);
        }
        const clone = new UpdateExpression(select, setter);
        clone.parameterTree = resolveTreeClone(this.parameterTree, replaceMap);
        replaceMap.set(this, clone);
        return clone;
    }
    getEffectedEntities() {
        return this.entity.entityTypes;
    }
    hashCode() {
        return hashCode("UPDATE", this.select.hashCode());
    }
    setOrder(expression, direction) {
        this.select.setOrder(expression, direction);
    }
    toString() {
        let setter = "";
        for (const prop in this.setter) {
            setter += `${prop}:${this.setter[prop].toString()},\n`;
        }
        return `Update(${this.entity.toString()}, {${setter}})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL1VwZGF0ZUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJckQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNckUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE1BQU0sT0FBTyxnQkFBMEIsU0FBUSxlQUFxQjtJQUNoRSxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBNkIsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsSUFBVyxLQUFLO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxJQUFJO1FBQ1gsT0FBTyxTQUFnQixDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFXLGdCQUFnQjtRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQkFBcUI7Z0JB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