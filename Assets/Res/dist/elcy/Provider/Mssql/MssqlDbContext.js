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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxEYkNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUHJvdmlkZXIvTXNzcWwvTXNzcWxEYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRTVFLE1BQU0sT0FBZ0IsY0FBZSxTQUFRLG1CQUE0QjtJQUF6RTs7UUFDYyxtQkFBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMscUJBQWdCLEdBQUcsaUJBQWlCLENBQUM7UUFDckMsMEJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDOUMscUJBQWdCLEdBQUcsc0JBQXNCLENBQUM7UUFDMUMsc0JBQWlCLEdBQUcsa0JBQWtCLENBQUM7UUFDdkMsZUFBVSxHQUFHLG9CQUFvQixDQUFDO0lBS2hELENBQUM7SUFIVSxjQUFjLENBQUksS0FBcUI7UUFDMUMsT0FBTyxJQUFJLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSiJ9