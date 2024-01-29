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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3U3FsRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vUmF3U3FsRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFN0MsTUFBTSxPQUFPLGdCQUFnQjtJQUN6QixZQUE0QixJQUFvQixFQUFrQixZQUFvQjtRQUExRCxTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUFrQixpQkFBWSxHQUFaLFlBQVksQ0FBUTtJQUFJLENBQUM7SUFDcEYsS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLGdCQUFnQixDQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BFLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxPQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQztJQUN2QyxDQUFDO0NBQ0oifQ==