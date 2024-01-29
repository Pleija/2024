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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsaXRlRGJDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1Byb3ZpZGVyL1NxbGl0ZS9TcWxpdGVEYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDNUMsTUFBTSxPQUFnQixlQUFnQixTQUFRLG1CQUE2QjtJQUEzRTs7UUFDVyxxQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQztRQUN0QyxnQkFBVyxHQUFHLHFCQUFxQixDQUFDO1FBQ3BDLHNCQUFpQixHQUFHLG1CQUFtQixDQUFDO1FBQ3JDLG1CQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ2hDLDBCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQzlDLHFCQUFnQixHQUFHLHNCQUFzQixDQUFDO1FBQzFDLGVBQVUsR0FBRyxvQkFBb0IsQ0FBQztJQUloRCxDQUFDO0lBSFUsa0JBQWtCLENBQUMsT0FBaUI7UUFDdkMsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=