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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvblV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9IZWxwZXIvRXhwcmVzc2lvblV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFeEYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDOUYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDMUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRTNFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdEMsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsVUFFdkMsUUFBWSxFQUFFLFNBQXNCLEVBQUUsU0FBaUIsRUFBRSxLQUFzQixFQUFFLElBQWtCO0lBQ2xHLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQW1CLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVELE1BQU0sV0FBVyxHQUViLEVBQUUsQ0FBQztJQUNQLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7UUFDMUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksUUFBcUIsQ0FBQztRQUMxQixJQUFJLEtBQUssWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3RDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQzthQUNJLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbkMsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQzthQUNJLENBQUM7WUFDRixRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDakMsQ0FBQztJQUNELE1BQU0sYUFBYSxHQUFHLElBQUkscUJBQXFCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25FLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBUSxDQUFDO0FBQ2pFLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsS0FBMEMsRUFBRSxVQUF5QyxFQUF1QyxFQUFFO0lBQzNKLE9BQU87UUFDSCxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtRQUNuRixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7S0FDeEUsQ0FBQztBQUNOLENBQUMsQ0FBQyJ9