import { ColumnGeneration } from "../Common/Enum";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
export class ComputedColumnMetaData {
    get type() {
        return this.functionExpression.type;
    }
    constructor(entity, fn, propertyName) {
        this.columnName = "";
        if (entity) {
            this.entity = entity;
        }
        if (fn) {
            this.functionExpression = ExpressionBuilder.parse(fn, [entity.type]);
        }
        if (propertyName) {
            this.propertyName = propertyName;
        }
    }
    get generation() {
        return ColumnGeneration.Insert | ColumnGeneration.Update;
    }
    applyOption(option) {
        if (typeof option.functionExpression !== "undefined") {
            this.functionExpression = option.functionExpression;
        }
        if (typeof option.propertyName !== "undefined") {
            this.propertyName = option.propertyName;
        }
        this.propertyName = option.propertyName;
        if (option.description) {
            this.description = option.description;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL0NvbXB1dGVkQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHbEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFJM0UsTUFBTSxPQUFPLHNCQUFzQjtJQUMvQixJQUFXLElBQUk7UUFDWCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7SUFDeEMsQ0FBQztJQUdELFlBQVksTUFBNEIsRUFBRSxFQUFvQixFQUFFLFlBQXVCO1FBY2hGLGVBQVUsR0FBRyxFQUFFLENBQUM7UUFibkIsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ0wsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBQ0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ3JDLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztJQUM3RCxDQUFDO0lBTU0sV0FBVyxDQUFDLE1BQWtDO1FBQ2pELElBQUksT0FBTyxNQUFNLENBQUMsa0JBQWtCLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDbkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsSUFBSSxPQUFPLE1BQU0sQ0FBQyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFtQixDQUFDO1FBQy9DLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUMxQyxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=