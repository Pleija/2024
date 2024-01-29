import { hashCode, resolveClone } from "../../Helper/Util";
export class EqualExpression {
    constructor(leftOperand, rightOperand) {
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
        this.type = Boolean;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new EqualExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode("==", this.leftOperand.hashCode()) + hashCode("==", this.rightOperand.hashCode());
    }
    toString() {
        return "(" + this.leftOperand.toString() + " == " + this.rightOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1YWxFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9FcXVhbEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUczRCxNQUFNLE9BQU8sZUFBZTtJQUN4QixZQUFtQixXQUF3QixFQUFTLFlBQXlCO1FBQTFELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQWE7UUFDdEUsU0FBSSxHQUFHLE9BQU8sQ0FBQztJQUQyRCxDQUFDO0lBRTNFLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9DLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQzNGLENBQUM7Q0FDSiJ9