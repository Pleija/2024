import { hashCode, resolveClone } from "../../Helper/Util";
export class OrExpression {
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
        const clone = new OrExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return this.leftOperand.hashCode() + hashCode("||") + this.rightOperand.hashCode();
    }
    toString() {
        return "(" + this.leftOperand.toString() + " || " + this.rightOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vT3JFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHM0QsTUFBTSxPQUFPLFlBQVk7SUFDckIsWUFBbUIsV0FBd0IsRUFBUyxZQUF5QjtRQUExRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBQ3RFLFNBQUksR0FBRyxPQUFPLENBQUM7SUFEMkQsQ0FBQztJQUUzRSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sS0FBSyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN2RixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQzNGLENBQUM7Q0FDSiJ9