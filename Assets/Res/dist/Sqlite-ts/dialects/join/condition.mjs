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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlLXRzL2RpYWxlY3RzL2pvaW4vY29uZGl0aW9uLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBWXhDLE1BQU0sT0FBTyxhQUFhO0lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQ2IsU0FBdUIsRUFDdkIsUUFBeUIsRUFDekIsTUFLUztRQUVULG1DQUFtQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFhLENBQUMsQ0FBQTtRQUVuRCwwQkFBMEI7UUFDMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUU1RCw4Q0FBOEM7UUFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFXLEVBQUUsT0FBYyxDQUFDLENBQUE7UUFFM0MsT0FBTztZQUNMLE1BQU07WUFDTixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7U0FDbkMsQ0FBQTtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsb0JBQW9CLENBQ3pCLFNBQXlCLEVBQ3pCLE1BQW1CO1FBRW5CLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNkLE1BQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQTtRQUU1QixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQWMsRUFBRSxFQUFFO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFBO1FBRUQsTUFBTSxDQUFDLElBQUksR0FBRztZQUNaLElBQUksRUFBRSxTQUFTO1NBQ2hCLENBQUE7UUFFRCw2Q0FBNkM7UUFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFFeEQsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDaEQsQ0FBQztRQUVELE9BQU8sRUFBRSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBWSxFQUFFLENBQUE7SUFDdkMsQ0FBQztJQUtELFlBQ0UsSUFBNkMsRUFDN0MsSUFBWSxFQUNaLElBQTZCO1FBRTdCLGFBQWE7UUFDYixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFBO1FBRTVCLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNDLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixDQUFDO0lBRUQsS0FBSyxDQUFDLENBQXFDO1FBQ3pDLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9CLE1BQU0sR0FBRyxHQUFJLENBQUMsQ0FBQyxDQUFDLENBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFFdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDVixJQUFJLEVBQUU7b0JBQ0osS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNuQixNQUFNLEVBQUUsQ0FBQztpQkFDVjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2IsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2Y7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0NBQ0YifQ==