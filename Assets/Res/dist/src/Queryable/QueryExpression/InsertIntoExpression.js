import { hashCode, resolveClone } from "../../Helper/Util";
import { QueryExpression } from "./QueryExpression";
export class InsertIntoExpression extends QueryExpression {
    get columns() {
        return this.select.selects;
    }
    get parameterTree() {
        return this.select.parameterTree;
    }
    get type() {
        return undefined;
    }
    constructor(entity, select) {
        super();
        this.entity = entity;
        this.select = select;
        this.select.isSelectOnly = true;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const entity = resolveClone(this.entity, replaceMap);
        const select = resolveClone(this.select, replaceMap);
        const clone = new InsertIntoExpression(entity, select);
        replaceMap.set(this, clone);
        return clone;
    }
    getEffectedEntities() {
        return this.entity.entityTypes;
    }
    hashCode() {
        return hashCode("INSERT", this.select.hashCode());
    }
    toString() {
        return `InsertInto({
Entity:${this.entity.toString()},
Select:${this.select.toString()}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zZXJ0SW50b0V4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0luc2VydEludG9FeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE1BQU0sT0FBTyxvQkFBOEIsU0FBUSxlQUFxQjtJQUNwRSxJQUFXLE9BQU87UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFDRCxJQUFXLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsSUFBVyxJQUFJO1FBQ1gsT0FBTyxTQUFnQixDQUFDO0lBQzVCLENBQUM7SUFDRCxZQUFtQixNQUEyQixFQUFTLE1BQXdCO1FBQzNFLEtBQUssRUFBRSxDQUFDO1FBRE8sV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFrQjtRQUUzRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDcEMsQ0FBQztJQUNNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckQsTUFBTSxLQUFLLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLG1CQUFtQjtRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU87U0FDTixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtTQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtHQUM1QixDQUFDO0lBQ0EsQ0FBQztDQUNKIn0=