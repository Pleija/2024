import { Utils } from '../../utils.mjs';
import { DialectKind } from '../base/index.mjs';
import { ReadAliasDialect } from '../base/readAlias.mjs';
export class JoinMapper {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlLXRzL2RpYWxlY3RzL2pvaW4vbWFwcGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRXhELE1BQU0sT0FBTyxVQUFVO0lBS3JCLFlBQVksU0FBdUIsRUFBRSxNQUFjLEVBQUUsU0FBaUI7UUFDcEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7SUFDNUIsQ0FBQztJQUVELEdBQUcsQ0FDRCxNQUVZO1FBRVosTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO1FBQ3JCLE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUE7UUFFMUMsK0JBQStCO1FBQy9CLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN6QyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUE7WUFDZCxhQUFhO1lBQ2IsTUFBTSxJQUFJLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO1lBQ2hELEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN6QyxDQUFDO1lBRUQsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNuQixPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ25CLENBQUM7UUFFRCw2Q0FBNkM7UUFDN0MsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFBO1FBQ25DLFNBQVMsaUJBQWlCLENBQUMsQ0FBSztZQUM5QixLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUNmLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQzFCLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzVCLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO29CQUV4QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNuQyxRQUFRLEVBQ1IsQ0FBQyxDQUNGLENBQUE7b0JBRUQsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUN2QyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO29CQUM3QixDQUFDO2dCQUNILENBQUM7cUJBQU0sQ0FBQztvQkFDTixpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDdEIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsb0JBQW9CO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFpQixDQUFDLENBQUE7UUFFckMsNEJBQTRCO1FBQzVCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRXRCLGlDQUFpQztRQUNqQyxNQUFNLEdBQUcsR0FBRyxVQUFVLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBRWxFLE9BQU8sSUFBSSxnQkFBZ0IsQ0FDekIsSUFBSSxDQUFDLFNBQVMsRUFDZCxHQUFHLEVBQ0gsV0FBVyxDQUFDLElBQUksRUFDaEIsT0FBTyxFQUNQLEdBQUcsQ0FDSixDQUFBO0lBQ0gsQ0FBQztDQUNGIn0=