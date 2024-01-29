import { NullConstructor } from "../../Common/Constant";
import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
export class TernaryExpression {
    get type() {
        if (this.trueOperand.type === this.falseOperand.type) {
            return this.trueOperand.type;
        }
        else if (this.trueOperand.type === NullConstructor) {
            return this.falseOperand.type;
        }
        else if (this.falseOperand.type === NullConstructor) {
            return this.trueOperand.type;
        }
        return Object;
    }
    constructor(logicalOperand, trueOperand, falseOperand) {
        this.logicalOperand = logicalOperand;
        this.trueOperand = trueOperand;
        this.falseOperand = falseOperand;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const logicalOperand = resolveClone(this.logicalOperand, replaceMap);
        const trueResultOperand = resolveClone(this.trueOperand, replaceMap);
        const falseResultOperand = resolveClone(this.falseOperand, replaceMap);
        const clone = new TernaryExpression(logicalOperand, trueResultOperand, falseResultOperand);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCodeAdd(hashCode(":", hashCode("?", this.logicalOperand.hashCode())), this.trueOperand.hashCode()), this.falseOperand.hashCode());
    }
    toString() {
        return "(" + this.logicalOperand.toString() + " ? " + this.trueOperand.toString() + " : " + this.falseOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybmFyeUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL1Rlcm5hcnlFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUd4RSxNQUFNLE9BQU8saUJBQWlCO0lBQzFCLElBQVcsSUFBSTtRQUNYLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFXLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2pDLENBQUM7YUFDSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLGVBQWUsRUFBRSxDQUFDO1lBQ2pELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFDbEMsQ0FBQzthQUNJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFLENBQUM7WUFDbEQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELFlBQW1CLGNBQW9DLEVBQVMsV0FBNEIsRUFBUyxZQUE2QjtRQUEvRyxtQkFBYyxHQUFkLGNBQWMsQ0FBc0I7UUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7UUFBUyxpQkFBWSxHQUFaLFlBQVksQ0FBaUI7SUFBSSxDQUFDO0lBQ2hJLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckUsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sS0FBSyxHQUFHLElBQUksaUJBQWlCLENBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDM0YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDN0osQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNuSSxDQUFDO0NBQ0oifQ==