import { NamingStrategy } from "../../Query/NamingStrategy";
import { POJOQueryResultParser } from "../../Query/POJOQueryResultParser";
import { RelationalDbContext } from "../Relational/RelationalDbContext";
import { RelationalQueryVisitor } from "../Relational/RelationalQueryVisitor";
import { MssqlQueryBuilder } from "./MssqlQueryBuilder";
import { mssqlQueryTranslator } from "./MssqlQueryTranslator";
import { MssqlSchemaBuilder } from "./MssqlSchemaBuilder";
import { MssqlInsertDeferredQuery } from "./Query/MssqlInsertDeferredQuery";
export class MssqlDbContext extends RelationalDbContext {
    constructor() {
        super(...arguments);
        this.namingStrategy = new NamingStrategy();
        this.queryBuilderType = MssqlQueryBuilder;
        this.queryResultParserType = POJOQueryResultParser;
        this.queryVisitorType = RelationalQueryVisitor;
        this.schemaBuilderType = MssqlSchemaBuilder;
        this.translator = mssqlQueryTranslator;
    }
    getInsertQuery(entry) {
        return new MssqlInsertDeferredQuery(entry);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxEYkNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Qcm92aWRlci9Nc3NxbC9Nc3NxbERiQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFNUUsTUFBTSxPQUFnQixjQUFlLFNBQVEsbUJBQTRCO0lBQXpFOztRQUNjLG1CQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN0QyxxQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztRQUNyQywwQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxxQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQztRQUMxQyxzQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQztRQUN2QyxlQUFVLEdBQUcsb0JBQW9CLENBQUM7SUFLaEQsQ0FBQztJQUhVLGNBQWMsQ0FBSSxLQUFxQjtRQUMxQyxPQUFPLElBQUksd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNKIn0=