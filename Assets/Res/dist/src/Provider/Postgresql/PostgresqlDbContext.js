import { NamingStrategy } from "../../Query/NamingStrategy";
import { POJOQueryResultParser } from "../../Query/POJOQueryResultParser";
import { RelationalDbContext } from "../Relational/RelationalDbContext";
import { RelationalQueryVisitor } from "../Relational/RelationalQueryVisitor";
import { PostgresqlQueryBuilder } from "./PostgresqlQueryBuilder";
import { postgresqlQueryTranslator } from "./PostgresqlQueryTranslator";
import { PostgresqlSchemaBuilder } from "./PostgresqlSchemaBuilder";
export class PostgresqlDbContext extends RelationalDbContext {
    constructor() {
        super(...arguments);
        this.namingStrategy = new NamingStrategy();
        this.queryBuilderType = PostgresqlQueryBuilder;
        this.queryResultParserType = POJOQueryResultParser;
        this.queryVisitorType = RelationalQueryVisitor;
        this.schemaBuilderType = PostgresqlSchemaBuilder;
        this.translator = postgresqlQueryTranslator;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGdyZXNxbERiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1Byb3ZpZGVyL1Bvc3RncmVzcWwvUG9zdGdyZXNxbERiQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFcEUsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxtQkFBaUM7SUFBbkY7O1FBQ2MsbUJBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3RDLHFCQUFnQixHQUFHLHNCQUFzQixDQUFDO1FBQzFDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLHFCQUFnQixHQUFHLHNCQUFzQixDQUFDO1FBQzFDLHNCQUFpQixHQUFHLHVCQUF1QixDQUFDO1FBQzVDLGVBQVUsR0FBRyx5QkFBeUIsQ0FBQztJQUNyRCxDQUFDO0NBQUEifQ==