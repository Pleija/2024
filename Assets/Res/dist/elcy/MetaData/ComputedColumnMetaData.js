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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9Db21wdXRlZENvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR2xELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBSTNFLE1BQU0sT0FBTyxzQkFBc0I7SUFDL0IsSUFBVyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO0lBQ3hDLENBQUM7SUFHRCxZQUFZLE1BQTRCLEVBQUUsRUFBb0IsRUFBRSxZQUF1QjtRQWNoRixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBYm5CLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNMLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUNELElBQUksWUFBWSxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNyQyxDQUFDO0lBQ0wsQ0FBQztJQUNELElBQVcsVUFBVTtRQUNqQixPQUFPLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7SUFDN0QsQ0FBQztJQU1NLFdBQVcsQ0FBQyxNQUFrQztRQUNqRCxJQUFJLE9BQU8sTUFBTSxDQUFDLGtCQUFrQixLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUM7UUFDeEQsQ0FBQztRQUNELElBQUksT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUM1QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBbUIsQ0FBQztRQUMvQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9