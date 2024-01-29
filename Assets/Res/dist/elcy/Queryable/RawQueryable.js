import { ParameterStack } from "../Common/ParameterStack";
import { ParameterExpression } from "../ExpressionBuilder/Expression/ParameterExpression";
import { hashCode, isNull } from "../Helper/Util";
import { Queryable } from "./Queryable";
import { RawEntityExpression } from "./QueryExpression/RawEntityExpression";
import { SelectExpression } from "./QueryExpression/SelectExpression";
import { SqlParameterExpression } from "./QueryExpression/SqlParameterExpression";
export class RawQueryable extends Queryable {
    get stackTree() {
        return this._param;
    }
    constructor(dbContext, schema, definingQuery, parameters, type) {
        super(type || Object);
        this.schema = schema;
        this.definingQuery = definingQuery;
        this._param = {
            node: new ParameterStack(),
            childrens: []
        };
        this._param.node.set(parameters);
        this._dbContext = dbContext;
        this.parameter(parameters);
    }
    get dbContext() {
        return this._dbContext;
    }
    buildQuery(visitor) {
        const queryBuilder = this.dbContext.queryBuilder;
        let definingQuery = this.definingQuery;
        const parameterExps = [];
        for (const [key, vals] of this._param.node) {
            const paramType = isNull(vals[0]) ? String : vals[0].constructor;
            const parameterExp = new SqlParameterExpression(visitor.newAlias("param"), new ParameterExpression(key, paramType, 0));
            parameterExps.push(parameterExp);
            definingQuery = definingQuery.replace(new RegExp("\\$\\{" + key + "\\}", "g"), queryBuilder.toString(parameterExp));
        }
        const rawEntity = new RawEntityExpression(this.type, this.schema, definingQuery, visitor.newAlias());
        const result = new SelectExpression(rawEntity);
        result.selects = rawEntity.columns.toArray();
        result.parameterTree = {
            node: parameterExps,
            childrens: []
        };
        visitor.setDefaultBehaviour(result);
        return result;
    }
    hashCode() {
        return hashCode(this.type.name, hashCode(this.definingQuery));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9SYXdRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFhLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3JFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV4QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUVsRixNQUFNLE9BQU8sWUFBZ0IsU0FBUSxTQUFZO0lBQzdDLElBQVcsU0FBUztRQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELFlBQVksU0FBb0IsRUFDRCxNQUEwRCxFQUM3RCxhQUFxQixFQUNyQyxVQUFtQyxFQUNuQyxJQUFxQjtRQUM3QixLQUFLLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBSkssV0FBTSxHQUFOLE1BQU0sQ0FBb0Q7UUFDN0Qsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFJN0MsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNWLElBQUksRUFBRSxJQUFJLGNBQWMsRUFBRTtZQUMxQixTQUFTLEVBQUUsRUFBRTtTQUNoQixDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQVcsU0FBUztRQUNoQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztRQUNqRCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLE1BQU0sYUFBYSxHQUE2QixFQUFFLENBQUM7UUFDbkQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFDakUsTUFBTSxZQUFZLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksbUJBQW1CLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3hILENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFtQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxhQUFhLEdBQUc7WUFDbkIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsU0FBUyxFQUFFLEVBQUU7U0FDaEIsQ0FBQztRQUNGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0NBQ0oifQ==