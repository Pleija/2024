import { hashCode, resolveClone } from "../../Helper/Util";
export class AndExpression {
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
        const clone = new AndExpression(left, right);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode("&&", this.leftOperand.hashCode()) + hashCode("&&", this.rightOperand.hashCode());
    }
    toString() {
        return "(" + this.leftOperand.toString() + " && " + this.rightOperand.toString() + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vQW5kRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzNELE1BQU0sT0FBTyxhQUFhO0lBQ3RCLFlBQW1CLFdBQWlDLEVBQVMsWUFBa0M7UUFBNUUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ3hGLFNBQUksR0FBRyxPQUFPLENBQUM7SUFENkUsQ0FBQztJQUU3RixLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdEcsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUMzRixDQUFDO0NBQ0oifQ==