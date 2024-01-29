import { SqlParameterExpression } from "./SqlParameterExpression";
import { SqlTableValueParameterExpression } from "./SqlTableValueParameterExpression";
export class QueryExpression {
    get parameterTree() {
        if (!this._parameterTree) {
            this._parameterTree = {
                node: [],
                childrens: []
            };
        }
        return this._parameterTree;
    }
    set parameterTree(value) {
        this._parameterTree = value;
    }
    addSqlParameter(name, valueExp, entityOrColMeta) {
        let sqlParameter;
        if (valueExp.type === Array) {
            sqlParameter = new SqlTableValueParameterExpression(name, valueExp, entityOrColMeta);
        }
        else {
            sqlParameter = new SqlParameterExpression(name, valueExp, entityOrColMeta);
        }
        this.parameterTree.node.push(sqlParameter);
        return sqlParameter;
    }
    replaceSqlParameter(input, replace) {
        const n = [this.parameterTree];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < n.length; ++i) {
            const t = n[i];
            if (t.node.delete(input)) {
                t.node.push(replace);
                break;
            }
            if (t.childrens.any()) {
                for (const c of t.childrens) {
                    n.push(c);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9RdWVyeUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFdEYsTUFBTSxPQUFnQixlQUFlO0lBQ2pDLElBQVcsYUFBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUc7Z0JBQ2xCLElBQUksRUFBRSxFQUFFO2dCQUNSLFNBQVMsRUFBRSxFQUFFO2FBQ2hCLENBQUM7UUFDTixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFDRCxJQUFXLGFBQWEsQ0FBQyxLQUFLO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQ2hDLENBQUM7SUFTTSxlQUFlLENBQU8sSUFBWSxFQUFFLFFBQTJCLEVBQUUsZUFBd0Q7UUFDNUgsSUFBSSxZQUFvQyxDQUFDO1FBQ3pDLElBQUssUUFBUSxDQUFDLElBQVksS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxZQUFZLEdBQUcsSUFBSSxnQ0FBZ0MsQ0FBQyxJQUFJLEVBQUUsUUFBNEIsRUFBRSxlQUF1QyxDQUFDLENBQUM7UUFDckksQ0FBQzthQUNJLENBQUM7WUFDRixZQUFZLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGVBQWtDLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNDLE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxLQUE2QixFQUFFLE9BQStCO1FBQ3JGLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9CLDBDQUEwQztRQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07WUFDVixDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQ3BCLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUMxQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9