import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
export class BitwiseZeroRightShiftAssignmentExpression {
    constructor(leftOperand, rightOperand) {
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
        this.type = Number;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const left = resolveClone(this.leftOperand, replaceMap);
        const right = resolveClone(this.rightOperand, replaceMap);
        const clone = new BitwiseZeroRightShiftAssignmentExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCode(">>=", this.leftOperand.hashCode()), this.rightOperand.hashCode());
    }
    toString() {
        return "(" + this.leftOperand.toString() + " >>= " + this.rightOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQml0d2lzZVplcm9SaWdodFNoaWZ0QXNzaWdubWVudEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9CaXR3aXNlWmVyb1JpZ2h0U2hpZnRBc3NpZ25tZW50RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUl4RSxNQUFNLE9BQU8seUNBQXlDO0lBQ2xELFlBQW1CLFdBQXdDLEVBQVMsWUFBaUM7UUFBbEYsZ0JBQVcsR0FBWCxXQUFXLENBQTZCO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQXFCO1FBQzlGLFNBQUksR0FBRyxNQUFNLENBQUM7SUFEb0YsQ0FBQztJQUVuRyxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sS0FBSyxHQUFHLElBQUkseUNBQXlDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDNUYsQ0FBQztDQUNKIn0=