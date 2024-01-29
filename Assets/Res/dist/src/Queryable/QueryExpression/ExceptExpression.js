import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { ProjectionEntityExpression } from "./ProjectionEntityExpression";
export class ExceptExpression extends ProjectionEntityExpression {
    constructor(subSelect, subSelect2, type) {
        super(subSelect, type);
        this.subSelect = subSelect;
        this.subSelect2 = subSelect2;
        this.subSelect2.isSubSelect = true;
        this.entityTypes = this.subSelect.entity.entityTypes.concat(this.subSelect2.entity.entityTypes).distinct().toArray();
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const select = resolveClone(this.subSelect, replaceMap);
        const select2 = resolveClone(this.subSelect2, replaceMap);
        const clone = new ExceptExpression(select, select2, this.type);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCode("EXCEPT", this.subSelect.hashCode()), this.subSelect2.hashCode());
    }
    toString() {
        return `Except(${this.subSelect.toString()}, ${this.subSelect2.toString()})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhjZXB0RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vRXhjZXB0RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUcxRSxNQUFNLE9BQU8sZ0JBQW9CLFNBQVEsMEJBQTZCO0lBQ2xFLFlBQTRCLFNBQThCLEVBQWtCLFVBQTRCLEVBQUUsSUFBcUI7UUFDM0gsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQURDLGNBQVMsR0FBVCxTQUFTLENBQXFCO1FBQWtCLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBRXBHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekgsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEQsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvRCxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sVUFBVSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNqRixDQUFDO0NBQ0oifQ==