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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybmFyeUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9UZXJuYXJ5RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHeEUsTUFBTSxPQUFPLGlCQUFpQjtJQUMxQixJQUFXLElBQUk7UUFDWCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBVyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNqQyxDQUFDO2FBQ0ksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUUsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQ2xDLENBQUM7YUFDSSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLGVBQWUsRUFBRSxDQUFDO1lBQ2xELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDakMsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxZQUFtQixjQUFvQyxFQUFTLFdBQTRCLEVBQVMsWUFBNkI7UUFBL0csbUJBQWMsR0FBZCxjQUFjLENBQXNCO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQWlCO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQWlCO0lBQUksQ0FBQztJQUNoSSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckUsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RSxNQUFNLEtBQUssR0FBRyxJQUFJLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzNGLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdKLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDbkksQ0FBQztDQUNKIn0=