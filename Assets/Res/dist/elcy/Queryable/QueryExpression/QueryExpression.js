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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vUXVlcnlFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRXRGLE1BQU0sT0FBZ0IsZUFBZTtJQUNqQyxJQUFXLGFBQWE7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHO2dCQUNsQixJQUFJLEVBQUUsRUFBRTtnQkFDUixTQUFTLEVBQUUsRUFBRTthQUNoQixDQUFDO1FBQ04sQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBVyxhQUFhLENBQUMsS0FBSztRQUMxQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUNoQyxDQUFDO0lBU00sZUFBZSxDQUFPLElBQVksRUFBRSxRQUEyQixFQUFFLGVBQXdEO1FBQzVILElBQUksWUFBb0MsQ0FBQztRQUN6QyxJQUFLLFFBQVEsQ0FBQyxJQUFZLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDbkMsWUFBWSxHQUFHLElBQUksZ0NBQWdDLENBQUMsSUFBSSxFQUFFLFFBQTRCLEVBQUUsZUFBdUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7YUFDSSxDQUFDO1lBQ0YsWUFBWSxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxlQUFrQyxDQUFDLENBQUM7UUFDbEcsQ0FBQztRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMzQyxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0sbUJBQW1CLENBQUMsS0FBNkIsRUFBRSxPQUErQjtRQUNyRixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQiwwQ0FBMEM7UUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQixNQUFNO1lBQ1YsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==