import { Utils } from '../../utils.mjs';
import { DialectKind } from '../base/index.mjs';
import { ReadAliasDialect } from '../base/readAlias.mjs';
export class JoinMapper {
    tableInfo;
    sqlClause;
    tables;
    constructor(tableInfo, tables, sqlClause) {
        this.tableInfo = tableInfo;
        this.tables = tables;
        this.sqlClause = sqlClause;
    }
    map(fields) {
        const descriptor = {};
        const aliases = {};
        // build descriptor and aliases
        for (const k of Object.keys(this.tables)) {
            const res = {};
            // @ts-ignore
            const info = this.tables[k].info;
            for (const d of Object.keys(info.descriptor)) {
                res[d] = k + '___' + info.descriptor[d];
            }
            descriptor[k] = res;
            aliases[k] = info;
        }
        // build selected fields for SELECT statement
        const selectedFields = [];
        function getSelectedFields(m) {
            for (const km of Object.keys(m)) {
                const r = m[km];
                if (typeof r === 'string') {
                    const field = r.split('___');
                    const toSelect = r.replace('___', '"."');
                    const select = Utils.selectAs(aliases[field[0]].columns[field[1]], toSelect, r);
                    if (selectedFields.indexOf(select) < 0) {
                        selectedFields.push(select);
                    }
                }
                else {
                    getSelectedFields(r);
                }
            }
        }
        // build map results
        const map = fields(descriptor);
        // get all columns to select
        getSelectedFields(map);
        // combine select join clause sql
        const sql = `SELECT ${selectedFields.join(',')} ${this.sqlClause}`;
        return new ReadAliasDialect(this.tableInfo, sql, DialectKind.JOIN, aliases, map);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlLXRzL2RpYWxlY3RzL2pvaW4vbWFwcGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRXhELE1BQU0sT0FBTyxVQUFVO0lBQ1QsU0FBUyxDQUFjO0lBQ3ZCLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQVE7SUFFeEIsWUFBWSxTQUF1QixFQUFFLE1BQWMsRUFBRSxTQUFpQjtRQUNsRSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtJQUM5QixDQUFDO0lBRUQsR0FBRyxDQUNDLE1BRVk7UUFFWixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDckIsTUFBTSxPQUFPLEdBQTJCLEVBQUUsQ0FBQTtRQUUxQywrQkFBK0I7UUFDL0IsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtZQUNkLGFBQWE7WUFDYixNQUFNLElBQUksR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7WUFDaEQsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzNDLENBQUM7WUFFRCxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ25CLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDckIsQ0FBQztRQUVELDZDQUE2QztRQUM3QyxNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUE7UUFFbkMsU0FBUyxpQkFBaUIsQ0FBQyxDQUFLO1lBQzVCLEtBQUssTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ2YsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDeEIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDNUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7b0JBRXhDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ25DLFFBQVEsRUFDUixDQUFDLENBQ0osQ0FBQTtvQkFFRCxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3JDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7b0JBQy9CLENBQUM7Z0JBQ0wsQ0FBQztxQkFBTSxDQUFDO29CQUNKLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUN4QixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxvQkFBb0I7UUFDcEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQWlCLENBQUMsQ0FBQTtRQUVyQyw0QkFBNEI7UUFDNUIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFdEIsaUNBQWlDO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLFVBQVUsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFFbEUsT0FBTyxJQUFJLGdCQUFnQixDQUN2QixJQUFJLENBQUMsU0FBUyxFQUNkLEdBQUcsRUFDSCxXQUFXLENBQUMsSUFBSSxFQUNoQixPQUFPLEVBQ1AsR0FBRyxDQUNOLENBQUE7SUFDTCxDQUFDO0NBQ0oifQ==