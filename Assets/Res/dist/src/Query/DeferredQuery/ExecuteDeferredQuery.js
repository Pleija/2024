import { QueryType } from "../../Common/Enum";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { hashCode } from "../../Helper/Util";
import { SqlParameterExpression } from "../../Queryable/QueryExpression/SqlParameterExpression";
import { DeferredQuery } from "./DeferredQuery";
const resultParser = (result) => {
    return result.sum((o) => o.effectedRows);
};
export class ExecuteDeferredQuery extends DeferredQuery {
    get queries() {
        if (!this._queries) {
            this._queries = [{
                    query: this.sql,
                    parameters: this.parameter,
                    type: QueryType.DML
                }];
        }
        return this._queries;
    }
    get sql() {
        if (!this._sql) {
            const template = this.dbContext.queryBuilder.toString(new SqlParameterExpression("$1", new ParameterExpression("$1")));
            this._sql = this.rawSql.replace(/\$\{([a-z_][a-z0-9_]*)\}/ig, template);
        }
        return this._sql;
    }
    constructor(dbContext, rawSql, parameter, queryOption) {
        super(dbContext, queryOption);
        this.rawSql = rawSql;
        this.parameter = parameter;
        this.resultParser = resultParser;
    }
    hashCode() {
        return hashCode(this.sql);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0V4ZWN1dGVEZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFJaEcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhELE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBc0IsRUFBRSxFQUFFO0lBQzVDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdDLENBQUMsQ0FBQztBQUNGLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxhQUFxQjtJQUMzRCxJQUFXLE9BQU87UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztvQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUc7b0JBQ2YsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUMxQixJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUc7aUJBQ3RCLENBQUMsQ0FBQztRQUVQLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUNELElBQVcsR0FBRztRQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDYixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkgsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxZQUFZLFNBQW9CLEVBQ1osTUFBYyxFQUNkLFNBQWtDLEVBQzFDLFdBQTBCO1FBQ2xDLEtBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFIZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsY0FBUyxHQUFULFNBQVMsQ0FBeUI7UUFJNUMsaUJBQVksR0FBRyxZQUFZLENBQUM7SUFEdEMsQ0FBQztJQUlNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNKIn0=