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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQml0d2lzZUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL0JpdHdpc2VFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxNQUFNLE9BQWdCLGlCQUFpQjtJQUF2QztRQUNXLFNBQUksR0FBRyxNQUFNLENBQUM7SUFZekIsQ0FBQztJQVRhLGNBQWMsQ0FBQyxPQUFvQjtRQUN6QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDMUIsT0FBTyxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvRixDQUFDO2FBQ0ksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQy9CLE9BQU8sR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pKLENBQUM7UUFDRCxPQUFPLE9BQWMsQ0FBQztJQUMxQixDQUFDO0NBQ0oifQ==