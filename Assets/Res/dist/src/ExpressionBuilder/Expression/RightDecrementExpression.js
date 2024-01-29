import { hashCode, resolveClone } from "../../Helper/Util";
export class RightDecrementExpression {
    constructor(operand) {
        this.operand = operand;
        this.type = Number;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const operand = resolveClone(this.operand, replaceMap);
        const clone = new RightDecrementExpression(operand);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode("--", this.operand.hashCode());
    }
    toString() {
        return this.operand.toString() + "--";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmlnaHREZWNyZW1lbnRFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9SaWdodERlY3JlbWVudEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUkzRCxNQUFNLE9BQU8sd0JBQXdCO0lBQ2pDLFlBQTRCLE9BQW9DO1FBQXBDLFlBQU8sR0FBUCxPQUFPLENBQTZCO1FBQ3pELFNBQUksR0FBRyxNQUFNLENBQUM7SUFEK0MsQ0FBQztJQUU5RCxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUksd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==