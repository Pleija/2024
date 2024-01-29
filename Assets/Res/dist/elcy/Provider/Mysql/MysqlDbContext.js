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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWxEYkNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUHJvdmlkZXIvTXlzcWwvTXlzcWxEYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTFELE1BQU0sT0FBZ0IsY0FBZSxTQUFRLG1CQUE0QjtJQUF6RTs7UUFDYyxtQkFBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMscUJBQWdCLEdBQUcsaUJBQWlCLENBQUM7UUFDckMsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMscUJBQWdCLEdBQUcsc0JBQXNCLENBQUM7UUFDMUMsc0JBQWlCLEdBQUcsa0JBQWtCLENBQUM7UUFDdkMsZUFBVSxHQUFHLG9CQUFvQixDQUFDO0lBQ2hELENBQUM7Q0FBQSJ9