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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGdyZXNxbERiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Qcm92aWRlci9Qb3N0Z3Jlc3FsL1Bvc3RncmVzcWxEYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXBFLE1BQU0sT0FBZ0IsbUJBQW9CLFNBQVEsbUJBQWlDO0lBQW5GOztRQUNjLG1CQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN0QyxxQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQztRQUMxQywwQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxxQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQztRQUMxQyxzQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQztRQUM1QyxlQUFVLEdBQUcseUJBQXlCLENBQUM7SUFDckQsQ0FBQztDQUFBIn0=