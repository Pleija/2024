import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
export class LeftDecrementExpression {
    constructor(operand) {
        this.operand = operand;
        this.type = Number;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const operand = resolveClone(this.operand, replaceMap);
        const clone = new LeftDecrementExpression(operand);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCode("--"), this.operand.hashCode());
    }
    toString() {
        return "--" + this.operand.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVmdERlY3JlbWVudEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9MZWZ0RGVjcmVtZW50RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUl4RSxNQUFNLE9BQU8sdUJBQXVCO0lBQ2hDLFlBQW1CLE9BQW9DO1FBQXBDLFlBQU8sR0FBUCxPQUFPLENBQTZCO1FBQ2hELFNBQUksR0FBRyxNQUFNLENBQUM7SUFEc0MsQ0FBQztJQUVyRCxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==