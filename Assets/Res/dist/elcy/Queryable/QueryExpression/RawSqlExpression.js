import { hashCode } from "../../Helper/Util";
export class RawSqlExpression {
    constructor(type, sqlStatement) {
        this.type = type;
        this.sqlStatement = sqlStatement;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const clone = new RawSqlExpression(this.type, this.sqlStatement);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode(this.sqlStatement);
    }
    toString() {
        return `Sql(${this.sqlStatement})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3U3FsRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL1Jhd1NxbEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTdDLE1BQU0sT0FBTyxnQkFBZ0I7SUFDekIsWUFBNEIsSUFBb0IsRUFBa0IsWUFBb0I7UUFBMUQsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFBa0IsaUJBQVksR0FBWixZQUFZLENBQVE7SUFBSSxDQUFDO0lBQ3BGLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBSSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sT0FBTyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUM7SUFDdkMsQ0FBQztDQUNKIn0=