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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3UXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1Jhd1F1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHckUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDMUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXhDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRWxGLE1BQU0sT0FBTyxZQUFnQixTQUFRLFNBQVk7SUFDN0MsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ0QsWUFBWSxTQUFvQixFQUNELE1BQTBELEVBQzdELGFBQXFCLEVBQ3JDLFVBQW1DLEVBQ25DLElBQXFCO1FBQzdCLEtBQUssQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7UUFKSyxXQUFNLEdBQU4sTUFBTSxDQUFvRDtRQUM3RCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUk3QyxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsSUFBSSxFQUFFLElBQUksY0FBYyxFQUFFO1lBQzFCLFNBQVMsRUFBRSxFQUFFO1NBQ2hCLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBR00sVUFBVSxDQUFDLE9BQXNCO1FBQ3BDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQ2pELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDdkMsTUFBTSxhQUFhLEdBQTZCLEVBQUUsQ0FBQztRQUNuRCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNqRSxNQUFNLFlBQVksR0FBRyxJQUFJLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkgsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqQyxhQUFhLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDeEgsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQW1CLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDcEgsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0MsTUFBTSxDQUFDLGFBQWEsR0FBRztZQUNuQixJQUFJLEVBQUUsYUFBYTtZQUNuQixTQUFTLEVBQUUsRUFBRTtTQUNoQixDQUFDO1FBQ0YsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FDSiJ9