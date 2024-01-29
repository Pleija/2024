import { FunctionCallExpression } from "./FunctionCallExpression";
import { MethodCallExpression } from "./MethodCallExpression";
import { ValueExpression } from "./ValueExpression";
export class BitwiseExpression {
    constructor() {
        this.type = Number;
    }
    convertOperand(operand) {
        if (operand.type === String) {
            operand = new FunctionCallExpression(new ValueExpression(parseInt), [operand], "parseInt");
        }
        else if (operand.type !== Number) {
            operand = new FunctionCallExpression(new ValueExpression(parseInt), [new MethodCallExpression(operand, "toString", [], String)], "parseInt");
        }
        return operand;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQml0d2lzZUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9CaXR3aXNlRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVsRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsTUFBTSxPQUFnQixpQkFBaUI7SUFBdkM7UUFDVyxTQUFJLEdBQUcsTUFBTSxDQUFDO0lBWXpCLENBQUM7SUFUYSxjQUFjLENBQUMsT0FBb0I7UUFDekMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQzFCLE9BQU8sR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0YsQ0FBQzthQUNJLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUMvQixPQUFPLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksb0JBQW9CLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqSixDQUFDO1FBQ0QsT0FBTyxPQUFjLENBQUM7SUFDMUIsQ0FBQztDQUNKIn0=