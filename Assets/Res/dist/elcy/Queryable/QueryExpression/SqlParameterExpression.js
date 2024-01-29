import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { resolveClone } from "../../Helper/Util";
export class SqlParameterExpression extends ParameterExpression {
    constructor(name, valueExp, column) {
        super(name, valueExp.type);
        this.name = name;
        this.valueExp = valueExp;
        this.column = column;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const valueGetter = resolveClone(this.valueExp, replaceMap);
        const clone = new SqlParameterExpression(this.name, valueGetter, this.column);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return this.valueExp.hashCode();
    }
    toString() {
        return this.valueExp.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsUGFyYW1ldGVyRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL1NxbFBhcmFtZXRlckV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR2pELE1BQU0sT0FBTyxzQkFBZ0MsU0FBUSxtQkFBc0I7SUFDdkUsWUFBbUIsSUFBWSxFQUFTLFFBQXdCLEVBQWtCLE1BQXdCO1FBQ3RHLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRFosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQWdCO1FBQWtCLFdBQU0sR0FBTixNQUFNLENBQWtCO0lBRTFHLENBQUM7SUFHTSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzVELE1BQU0sS0FBSyxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLENBQUM7Q0FDSiJ9