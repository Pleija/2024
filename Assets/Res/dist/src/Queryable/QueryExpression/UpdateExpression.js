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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vVXBkYXRlRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUlyRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU1yRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsTUFBTSxPQUFPLGdCQUEwQixTQUFRLGVBQXFCO0lBQ2hFLElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUE2QixDQUFDO0lBQ3JELENBQUM7SUFDRCxJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLElBQUk7UUFDWCxPQUFPLFNBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQVcsS0FBSztRQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQVcsZ0JBQWdCO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQjtnQkFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUN4RyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2xDLENBQUM7SUFDRCxZQUFZLE1BQTJCLEVBQ1gsTUFBOEMsRUFDOUMsd0JBQXdCLEtBQUs7UUFDckQsS0FBSyxFQUFFLENBQUM7UUFGZ0IsV0FBTSxHQUFOLE1BQU0sQ0FBd0M7UUFDOUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFRO1FBRXJELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQU9NLE9BQU8sQ0FBUyxLQUErQixFQUFFLHVCQUFzSCxFQUFFLElBQWU7UUFDM0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsdUJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUNNLFFBQVEsQ0FBQyxVQUFnQztRQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRCxNQUFNLE1BQU0sR0FBdUMsRUFBRSxDQUFDO1FBQ3RELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZFLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUdNLFFBQVEsQ0FBQyxVQUFpRCxFQUFFLFNBQTBCO1FBQ3pGLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUNNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUMzRCxDQUFDO1FBQ0QsT0FBTyxVQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sTUFBTSxJQUFJLENBQUM7SUFDNUQsQ0FBQztDQUNKIn0=