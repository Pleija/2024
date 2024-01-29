import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { hashCode } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class TakeQueryable extends Queryable {
    constructor(parent, quantity) {
        super(parent.type, parent.parameter({ take: quantity }));
        this.quantity = quantity;
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "take", [new ParameterExpression("take", Number)]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        return hashCode("TAKE", this.parent.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFrZVF1ZXJ5YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvVGFrZVF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUM1RixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl4QyxNQUFNLE9BQU8sYUFBaUIsU0FBUSxTQUFZO0lBQzlDLFlBQVksTUFBb0IsRUFBcUIsUUFBZ0I7UUFDakUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFEUixhQUFRLEdBQVIsUUFBUSxDQUFRO0lBRXJFLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBc0I7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDakcsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBUSxDQUFDO0lBQzlELENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0oifQ==