import { buildJoinSql } from './sql.mjs';
export class JoinCondition {
    static buildSql(tableInfo, selector, clause) {
        // get selected tables to be joined
        const tables = selector(tableInfo.db.tables);
        // prepare join conditions
        const condObj = this.buildConditionObject(tableInfo, tables);
        // invoke join clause against condition object
        clause(condObj.self, condObj);
        return {
            tables,
            sql: buildJoinSql(tables, condObj)
        };
    }
    static buildConditionObject(tableInfo, tables) {
        const obj = {};
        const stmts = [];
        const pushSql = (stmt) => {
            stmts.push(stmt);
        };
        tables.self = {
            info: tableInfo
        };
        // tslint:disable-next-line:no-string-literal
        obj['self'] = new JoinCondition(tables, 'self', pushSql);
        for (const k of Object.keys(tables)) {
            obj[k] = new JoinCondition(tables, k, pushSql);
        }
        return { ...obj, sqls: stmts };
    }
    __alias;
    __push;
    constructor(root, name, push) {
        // @ts-ignore
        const info = root[name].info;
        for (const k of Object.keys(info.columns)) {
            this[k] = name + '.' + info.descriptor[k];
        }
        this.__alias = name;
        this.__push = push;
    }
    equal(p) {
        for (const k of Object.keys(p)) {
            const val = p[k].split('.');
            this.__push({
                left: {
                    alias: this.__alias,
                    column: k
                },
                right: {
                    alias: val[0],
                    column: val[1]
                }
            });
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlLXRzL2RpYWxlY3RzL2pvaW4vY29uZGl0aW9uLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBWXhDLE1BQU0sT0FBTyxhQUFhO0lBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQ1gsU0FBdUIsRUFDdkIsUUFBeUIsRUFDekIsTUFLUztRQUVULG1DQUFtQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFhLENBQUMsQ0FBQTtRQUVuRCwwQkFBMEI7UUFDMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUU1RCw4Q0FBOEM7UUFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFXLEVBQUUsT0FBYyxDQUFDLENBQUE7UUFFM0MsT0FBTztZQUNILE1BQU07WUFDTixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7U0FDckMsQ0FBQTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsb0JBQW9CLENBQ3ZCLFNBQXlCLEVBQ3pCLE1BQW1CO1FBRW5CLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNkLE1BQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQTtRQUU1QixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQWMsRUFBRSxFQUFFO1lBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEIsQ0FBQyxDQUFBO1FBRUQsTUFBTSxDQUFDLElBQUksR0FBRztZQUNWLElBQUksRUFBRSxTQUFTO1NBQ2xCLENBQUE7UUFFRCw2Q0FBNkM7UUFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFFeEQsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDbEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbEQsQ0FBQztRQUVELE9BQU8sRUFBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBWSxFQUFDLENBQUE7SUFDdkMsQ0FBQztJQUVPLE9BQU8sQ0FBUTtJQUNmLE1BQU0sQ0FBeUI7SUFFdkMsWUFDSSxJQUE2QyxFQUM3QyxJQUFZLEVBQ1osSUFBNkI7UUFFN0IsYUFBYTtRQUNiLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFFNUIsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0MsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsQ0FBcUM7UUFDdkMsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxHQUFHLEdBQUksQ0FBQyxDQUFDLENBQUMsQ0FBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUV2QyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNSLElBQUksRUFBRTtvQkFDRixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ25CLE1BQU0sRUFBRSxDQUFDO2lCQUNaO2dCQUNELEtBQUssRUFBRTtvQkFDSCxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDYixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDakI7YUFDSixDQUFDLENBQUE7UUFDTixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0NBQ0oifQ==