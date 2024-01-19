import 'reflect-metadata';
import { COLUMN_META_KEY } from './column.mjs';
import { Dialect } from './dialects/index.mjs';
import { PRIMARY_META_KEY } from './primary.mjs';
import { Utils } from './utils.mjs';
export class Table extends Dialect {
    static buildTableInfo(db, entity, name) {
        const table = new entity();
        const properties = Object.getOwnPropertyNames(table);
        const descriptor = {};
        const columns = {};
        for (const key of properties) {
            ;
            descriptor[key] = key;
            let primary = false;
            let column = Reflect.getMetadata(COLUMN_META_KEY, table, key);
            if (!column) {
                column = Reflect.getMetadata(PRIMARY_META_KEY, table, key);
                primary = true;
            }
            if (column) {
                columns[key] = {
                    primary,
                    ...column
                };
            }
        }
        return {
            db,
            name,
            columns,
            descriptor
        };
    }
    constructor(entity, name, db) {
        super(Table.buildTableInfo(db, entity, name));
        this._mapResult = this._mapResult.bind(this);
    }
    async buildBackupSql() {
        const { db, name, columns } = this.info;
        const cols = Object.keys(columns)
            .map(c => Utils.quote(c))
            .join(', ');
        const tbl = Utils.quote(name);
        // get data values
        const values = await db.query(`SELECT ${cols} FROM ${tbl}`);
        if (!values || !values.length) {
            return '';
        }
        // build ordered column names
        const keys = Object.keys(values[0]);
        // build insert values sql
        const sql = `INSERT INTO ${tbl} (${keys
            .map(c => Utils.quote(c))
            .join(', ')}) VALUES ${values
            .map(value => {
            return ('(' +
                keys
                    .map(col => Utils.asRawValue(this.info.columns[col].type, value[col]))
                    .join(',') +
                ')');
        })
            .join(',')}`;
        return sql + ';';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TcWxpdGUtdHMvdGFibGUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUE7QUFDekIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUU5QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDOUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFBO0FBRWhELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFbkMsTUFBTSxPQUFPLEtBQTZDLFNBQVEsT0FHakU7SUFDQyxNQUFNLENBQUMsY0FBYyxDQUNuQixFQUFXLEVBQ1gsTUFBUyxFQUNULElBQVk7UUFFWixNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFBO1FBRTFCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDckIsTUFBTSxPQUFPLEdBQXlELEVBQUUsQ0FBQTtRQUV4RSxLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzdCLENBQUM7WUFBQyxVQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUUvQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7WUFDbkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FDOUIsZUFBZSxFQUNmLEtBQUssRUFDTCxHQUFHLENBQ1UsQ0FBQTtZQUVmLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDWixNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFlLENBQUE7Z0JBQ3hFLE9BQU8sR0FBRyxJQUFJLENBQUE7WUFDaEIsQ0FBQztZQUVELElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHO29CQUNiLE9BQU87b0JBQ1AsR0FBRyxNQUFNO2lCQUNWLENBQUE7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU87WUFDTCxFQUFFO1lBQ0YsSUFBSTtZQUNKLE9BQU87WUFDUCxVQUFVO1NBQ1gsQ0FBQTtJQUNILENBQUM7SUFFRCxZQUFZLE1BQVMsRUFBRSxJQUFZLEVBQUUsRUFBUztRQUM1QyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWM7UUFDbEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUV2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNiLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFN0Isa0JBQWtCO1FBQ2xCLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQzNELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsT0FBTyxFQUFFLENBQUE7UUFDWCxDQUFDO1FBRUQsNkJBQTZCO1FBQzdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFbkMsMEJBQTBCO1FBQzFCLE1BQU0sR0FBRyxHQUFHLGVBQWUsR0FBRyxLQUFLLElBQUk7YUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksTUFBTTthQUM1QixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDWCxPQUFPLENBQ0wsR0FBRztnQkFDSCxJQUFJO3FCQUNELEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUNULEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUMxRDtxQkFDQSxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNaLEdBQUcsQ0FDSixDQUFBO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUE7UUFDZCxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDbEIsQ0FBQztDQUNGIn0=