import { NullConstructor } from "../../Common/Constant";
import { hashCode } from "../../Helper/Util";
export class ValueExpression {
    get type() {
        if (this.value === null || this.value === undefined) {
            return NullConstructor;
        }
        return this.value.constructor;
    }
    constructor(value, expressionString = null) {
        this.value = value;
        this.expressionString = expressionString;
    }
    clone() {
        return this;
    }
    hashCode() {
        return hashCode(this.expressionString ? this.expressionString : this.value ? this.value.toString() : "NULL");
    }
    toString() {
        if (!this.expressionString) {
            this.expressionString = JSON.stringify(this.value);
        }
        return this.expressionString;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFsdWVFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vVmFsdWVFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHN0MsTUFBTSxPQUFPLGVBQWU7SUFDeEIsSUFBVyxJQUFJO1FBQ1gsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2xELE9BQU8sZUFBc0IsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQWtCLENBQUM7SUFDekMsQ0FBQztJQUNELFlBQTRCLEtBQVEsRUFBUyxtQkFBMkIsSUFBSTtRQUFoRCxVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQVMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFlO0lBQUksQ0FBQztJQUMxRSxLQUFLO1FBQ1IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakgsQ0FBQztJQUNNLFFBQVE7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUNqQyxDQUFDO0NBQ0oifQ==