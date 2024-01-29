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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnkvRGVmZXJyZWRRdWVyeS9FeGVjdXRlRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFOUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBSWhHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLFlBQVksR0FBRyxDQUFDLE1BQXNCLEVBQUUsRUFBRTtJQUM1QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFDRixNQUFNLE9BQU8sb0JBQXFCLFNBQVEsYUFBcUI7SUFDM0QsSUFBVyxPQUFPO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7b0JBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHO29CQUNmLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDMUIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHO2lCQUN0QixDQUFDLENBQUM7UUFFUCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFXLEdBQUc7UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBQ0QsWUFBWSxTQUFvQixFQUNaLE1BQWMsRUFDZCxTQUFrQyxFQUMxQyxXQUEwQjtRQUNsQyxLQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBSGQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGNBQVMsR0FBVCxTQUFTLENBQXlCO1FBSTVDLGlCQUFZLEdBQUcsWUFBWSxDQUFDO0lBRHRDLENBQUM7SUFJTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDSiJ9