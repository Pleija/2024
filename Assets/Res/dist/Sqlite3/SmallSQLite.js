// import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { Database } from "../Sqlite-ts/drivers/Database.mjs";
/**
 * All your model classes should extend this class
 * It includes the incremental 'id' by default
 * ```ts
 * class User extends SSQLTable {
 *     username = "";
 *     age = 18;
 *     active = false;
 * }
 * ```
 * @export
 * @class SSQLTable
 */
export class SSQLTable {
    id = -1;
}
/**
 * ORM Wrapper to interact with deno.land/x/sqlite using your `SSQLTable`
 * @export
 * @class SSQL
 */
export class SSQL {
    db;
    defaults;
    /**
     * Create an instance of SSQL
     * ```ts
     * const orm = new SSQL("test.db", [User]);
     * ```
     * @param dbName the name of the database file on disk used by sqlite
     * @param entities array of all models extending `SSQLTable`
     * @param defaults optional configuration to override DEFAULT vaules of columns by type
     */
    constructor(dbName, entities, defaults) {
        this.db = new Database(dbName);
        defaults ? this.defaults = defaults : this.defaults = {
            bool: false,
            int: -1,
            str: ""
        };
        for (const entity of entities) {
            const obj = new entity();
            this.createTable(obj); // create the table if it is not yet there
            const names = Object.getOwnPropertyNames(obj);
            // retrieve a list of all columns known in the sqlite db
            const data = [];
            for (const [loc, col] of this.db.query("PRAGMA table_info(" + obj.constructor.name.toLowerCase() + ");")) {
                data.push(col);
            }
            // check if there are new properties in the model compared to the table in sqlite
            const n = names.filter((item) => !data.includes(item));
            if (n.length > 0)
                this.alterTable(obj, n);
        }
    }
    columnInfo(table, column) {
        const v = Object.getOwnPropertyDescriptor(table, column);
        if (column === "id") {
            return "integer PRIMARY KEY AUTOINCREMENT NOT NULL";
        }
        else if (typeof v?.value === "boolean") {
            return "boolean NOT NULL DEFAULT " + this.defaults.bool;
        }
        else if (typeof v?.value === "string") {
            return 'varchar DEFAULT "' + this.defaults.str + '"';
        }
        else if (typeof v?.value === "number") {
            return "integer NOT NULL DEFAULT " + this.defaults.int;
        }
        return undefined;
    }
    alterTable(table, columns) {
        for (const column of columns) {
            const statement = 'ALTER TABLE "' + table.constructor.name.toLowerCase() +
                '\" ADD COLUMN ' + column + " " +
                this.columnInfo(table, column);
            this.db.query(statement);
        }
    }
    createTable(table) {
        const names = Object.getOwnPropertyNames(table);
        let statement = 'CREATE TABLE IF NOT EXISTS "' + table.constructor.name.toLowerCase() + '" (';
        for (const p of names) {
            if (!statement.endsWith("("))
                statement += ", ";
            statement += '"' + p + '" ' + this.columnInfo(table, p);
        }
        statement += ")";
        this.db.query(statement);
    }
    insertRecord(table) {
        const names = Object.getOwnPropertyNames(table);
        names.splice(0, 1);
        const statement = 'INSERT INTO "' +
            table.constructor.name.toLowerCase() +
            '" (' + names.join(", ") + ") VALUES (" +
            (new Array(names.length).fill("?")).join(", ") + ")";
        const data = [];
        for (const p of names) {
            const v = Object.getOwnPropertyDescriptor(table, p);
            data.push(v?.value);
        }
        this.db.query(statement, data);
        table.id = this.db.lastInsertRowId;
    }
    updateRecord(table) {
        const names = Object.getOwnPropertyNames(table);
        names.splice(0, 1);
        let statement = 'UPDATE "' + table.constructor.name.toLowerCase() + '" SET ';
        const data = [];
        for (const p of names) {
            const v = Object.getOwnPropertyDescriptor(table, p);
            if (!statement.endsWith("SET "))
                statement += ", ";
            statement += p + " = ?";
            data.push(v?.value);
        }
        statement += " WHERE id = ?";
        data.push(table.id);
        this.db.query(statement, data);
    }
    find(table, query, countOnly) {
        let select = "*";
        if (countOnly)
            select = "COUNT(*) AS total";
        const obj = new table();
        const rows = this.db.query("SELECT " + select + ' FROM "' + obj.constructor.name + '"' +
            (query.where ? (" WHERE " + query.where.clause) : "") +
            (query.order ? (" ORDER BY " + query.order.by + (query.order.desc ? " DESC " : " ASC ")) : "") +
            (query.limit ? " LIMIT " + query.limit : "") +
            (query.offset ? " OFFSET " + query.offset : ""), (query.where ? query.where.values : []));
        if (!countOnly) {
            const list = [];
            let names = [];
            try {
                names = rows.columns().map((item) => item.name);
            }
            catch (e) {
                return { count: 0, objects: list };
            }
            for (const row of rows) {
                const nobj = new table();
                for (let i = 0; i < names.length; i++) {
                    Object.defineProperty(nobj, names[i], { value: row[i] });
                }
                list.push(nobj);
            }
            return { count: list.length, objects: list };
        }
        else {
            return { count: rows.next().value[0], objects: [] };
        }
    }
    /**
     * DELETE the obj from the SQLite database
     * @param obj model based on `SSQLTable`
     */
    delete(obj) {
        this.db.query('DELETE FROM "' + obj.constructor.name + '" WHERE id = ?', [obj.id]);
    }
    /**
     * INSERT or UPDATE the obj based on the id (INSERT when -1 else UPDATE)
     * @param obj model based on `SSQLTable`
     */
    save(obj) {
        if (obj.id === -1)
            this.insertRecord(obj);
        else
            this.updateRecord(obj);
    }
    /**
     * SELECT * FROM table and return model WHERE id equals given id
     * ```ts
     * const user = orm.findOne(User, 1);
     * ```
     * @param table
     * @param id id to match with `SSQLTable`
     */
    findOne(table, id) {
        return this.find(table, { where: { clause: "id = ?", values: [id] } }).objects[0];
    }
    /**
     * ```ts
     * const users = orm.findMany(User, { where: { clause: "username = ?", values: [username] }});
     * ```
     * @param table
     * @param query
     */
    findMany(table, query) {
        return this.find(table, query).objects;
    }
    /**
     * COUNT(*) on all records in the table given
     * @param table
     */
    count(table) {
        return this.find(table, {}, true).count;
    }
    /**
     * COUNT(*) on all records in the table given matching the `SSQLQuery` query object
     * @param table
     * @param query
     */
    countBy(table, query) {
        return this.find(table, query, true).count;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU21hbGxTUUxpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZTMvU21hbGxTUUxpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaUVBQWlFO0FBRWpFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUU3RDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLE9BQU8sU0FBUztJQUNsQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDWDtBQTZCRDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLElBQUk7SUFDTixFQUFFLENBQVc7SUFDWixRQUFRLENBQWU7SUFFL0I7Ozs7Ozs7O09BUUc7SUFDSCxZQUFZLE1BQWMsRUFBRSxRQUFpQyxFQUFFLFFBQXVCO1FBQ2xGLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNsRCxJQUFJLEVBQUUsS0FBSztZQUNYLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDUCxHQUFHLEVBQUUsRUFBRTtTQUNWLENBQUM7UUFDRixLQUFLLE1BQU0sTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzVCLE1BQU0sR0FBRyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDBDQUEwQztZQUNqRSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsd0RBQXdEO1lBQ3hELE1BQU0sSUFBSSxHQUFhLEVBQUUsQ0FBQztZQUMxQixLQUNJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksSUFB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