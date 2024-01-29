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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zZXJ0SW50b0V4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9JbnNlcnRJbnRvRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzNELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxNQUFNLE9BQU8sb0JBQThCLFNBQVEsZUFBcUI7SUFDcEUsSUFBVyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBVyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDckMsQ0FBQztJQUNELElBQVcsSUFBSTtRQUNYLE9BQU8sU0FBZ0IsQ0FBQztJQUM1QixDQUFDO0lBQ0QsWUFBbUIsTUFBMkIsRUFBUyxNQUF3QjtRQUMzRSxLQUFLLEVBQUUsQ0FBQztRQURPLFdBQU0sR0FBTixNQUFNLENBQXFCO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7UUFFM0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ3BDLENBQUM7SUFDTSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPO1NBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7U0FDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7R0FDNUIsQ0FBQztJQUNBLENBQUM7Q0FDSiJ9