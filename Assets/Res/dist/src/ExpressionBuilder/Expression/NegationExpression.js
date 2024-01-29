import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
export class NegationExpression {
    constructor(operand) {
        this.operand = operand;
        this.type = Number;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const operand = resolveClone(this.operand, replaceMap);
        const clone = new NegationExpression(operand);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCodeAdd(hashCode("-"), this.operand.hashCode());
    }
    toString() {
        return "-" + this.operand.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmVnYXRpb25FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9OZWdhdGlvbkV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHeEUsTUFBTSxPQUFPLGtCQUFrQjtJQUMzQixZQUFtQixPQUE0QjtRQUE1QixZQUFPLEdBQVAsT0FBTyxDQUFxQjtRQUN4QyxTQUFJLEdBQUcsTUFBTSxDQUFDO0lBRDhCLENBQUM7SUFFN0MsS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekMsQ0FBQztDQUNKIn0=