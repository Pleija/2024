import { NamingStrategy } from "../../Query/NamingStrategy";
import { POJOQueryResultParser } from "../../Query/POJOQueryResultParser";
import { RelationalDbContext } from "../Relational/RelationalDbContext";
import { RelationalQueryVisitor } from "../Relational/RelationalQueryVisitor";
import { MysqlQueryBuilder } from "./MysqlQueryBuilder";
import { mysqlQueryTranslator } from "./MysqlQueryTranslator";
import { MysqlSchemaBuilder } from "./MySqlSchemaBuilder";
export class MysqlDbContext extends RelationalDbContext {
    constructor() {
        super(...arguments);
        this.namingStrategy = new NamingStrategy();
        this.queryBuilderType = MysqlQueryBuilder;
        this.queryResultParserType = POJOQueryResultParser;
        this.queryVisitorType = RelationalQueryVisitor;
        this.schemaBuilderType = MysqlSchemaBuilder;
        this.translator = mysqlQueryTranslator;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWxEYkNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Qcm92aWRlci9NeXNxbC9NeXNxbERiQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFMUQsTUFBTSxPQUFnQixjQUFlLFNBQVEsbUJBQTRCO0lBQXpFOztRQUNjLG1CQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN0QyxxQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztRQUNyQywwQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxxQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQztRQUMxQyxzQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQztRQUN2QyxlQUFVLEdBQUcsb0JBQW9CLENBQUM7SUFDaEQsQ0FBQztDQUFBIn0=