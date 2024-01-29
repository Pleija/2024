import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { ObjectValueExpression } from "../ExpressionBuilder/Expression/ObjectValueExpression";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { ValueExpression } from "../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { resolveClone } from "./Util";
export const toObjectFunctionExpression = function (objectFn, paramType, paramName, stack, type) {
    const param = new ParameterExpression(paramName, paramType);
    const objectValue = {};
    for (const prop in objectFn) {
        const value = objectFn[prop];
        let valueExp;
        if (value instanceof FunctionExpression) {
            if (value.params.length > 0) {
                value.params[0].name = paramName;
            }
            valueExp = value.body;
        }
        else if (typeof value === "function") {
            const fnExp = ExpressionBuilder.parse(value, [paramType], stack);
            if (fnExp.params.length > 0) {
                fnExp.params[0].name = paramName;
            }
            valueExp = fnExp.body;
        }
        else {
            valueExp = new ValueExpression(value);
        }
        objectValue[prop] = valueExp;
    }
    const objExpression = new ObjectValueExpression(objectValue, type);
    return new FunctionExpression(objExpression, [param]);
};
export const resolveTreeClone = (tree1, replaceMap) => {
    return {
        childrens: tree1.childrens.select((o) => resolveTreeClone(o, replaceMap)).toArray(),
        node: tree1.node.select((o) => resolveClone(o, replaceMap)).toArray()
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvblV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvSGVscGVyL0V4cHJlc3Npb25VdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRXhGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzlGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUNsRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUUzRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLFVBRXZDLFFBQVksRUFBRSxTQUFzQixFQUFFLFNBQWlCLEVBQUUsS0FBc0IsRUFBRSxJQUFrQjtJQUNsRyxNQUFNLEtBQUssR0FBRyxJQUFJLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM1RCxNQUFNLFdBQVcsR0FFYixFQUFFLENBQUM7SUFDUCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQzFCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLFFBQXFCLENBQUM7UUFDMUIsSUFBSSxLQUFLLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFDckMsQ0FBQztZQUNELFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7YUFDSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ25DLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFDckMsQ0FBQztZQUNELFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7YUFDSSxDQUFDO1lBQ0YsUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ2pDLENBQUM7SUFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRSxPQUFPLElBQUksa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQVEsQ0FBQztBQUNqRSxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEtBQTBDLEVBQUUsVUFBeUMsRUFBdUMsRUFBRTtJQUMzSixPQUFPO1FBQ0gsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7UUFDbkYsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0tBQ3hFLENBQUM7QUFDTixDQUFDLENBQUMifQ==