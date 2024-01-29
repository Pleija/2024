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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFsdWVFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9WYWx1ZUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXhELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUc3QyxNQUFNLE9BQU8sZUFBZTtJQUN4QixJQUFXLElBQUk7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbEQsT0FBTyxlQUFzQixDQUFDO1FBQ2xDLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBa0IsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsWUFBNEIsS0FBUSxFQUFTLG1CQUEyQixJQUFJO1FBQWhELFVBQUssR0FBTCxLQUFLLENBQUc7UUFBUyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWU7SUFBSSxDQUFDO0lBQzFFLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqSCxDQUFDO0lBQ00sUUFBUTtRQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7Q0FDSiJ9