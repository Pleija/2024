import { NamingStrategy } from "../../Query/NamingStrategy";
import { POJOQueryResultParser } from "../../Query/POJOQueryResultParser";
import { mssqlQueryTranslator } from "../Mssql/MssqlQueryTranslator";
import { RelationalDbContext } from "../Relational/RelationalDbContext";
import { RelationalQueryVisitor } from "../Relational/RelationalQueryVisitor";
import { SqliteQueryBuilder } from "./SqliteQueryBuilder";
import { SqliteSchemaBuilder } from "./SqliteSchemaBuilder";
const namingStrategy = new NamingStrategy();
export class SqliteDbContext extends RelationalDbContext {
    constructor() {
        super(...arguments);
        this.queryBuilderType = SqliteQueryBuilder;
        this.queryParser = POJOQueryResultParser;
        this.schemaBuilderType = SqliteSchemaBuilder;
        this.namingStrategy = namingStrategy;
        this.queryResultParserType = POJOQueryResultParser;
        this.queryVisitorType = RelationalQueryVisitor;
        this.translator = mssqlQueryTranslator;
    }
    mergeQueryCommands(queries) {
        return queries;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsaXRlRGJDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUHJvdmlkZXIvU3FsaXRlL1NxbGl0ZURiQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDckUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUM1QyxNQUFNLE9BQWdCLGVBQWdCLFNBQVEsbUJBQTZCO0lBQTNFOztRQUNXLHFCQUFnQixHQUFHLGtCQUFrQixDQUFDO1FBQ3RDLGdCQUFXLEdBQUcscUJBQXFCLENBQUM7UUFDcEMsc0JBQWlCLEdBQUcsbUJBQW1CLENBQUM7UUFDckMsbUJBQWMsR0FBRyxjQUFjLENBQUM7UUFDaEMsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMscUJBQWdCLEdBQUcsc0JBQXNCLENBQUM7UUFDMUMsZUFBVSxHQUFHLG9CQUFvQixDQUFDO0lBSWhELENBQUM7SUFIVSxrQkFBa0IsQ0FBQyxPQUFpQjtRQUN2QyxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0oifQ==