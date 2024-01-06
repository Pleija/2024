// import * as core from './core';
import { qualifiySchemaIdentifier } from '../utils/index.mjs';
import { Table } from './Table.mjs';
/**
 * A singleton holding the database schema definitions
 *
 * @export
 * @class Schema
 */
export class Schema {
    /**
     * The one and only Schema instance
     *
     * @static
     */
    static schema;
    mapNameToTable;
    _dateInMilliSeconds;
    get dateInMilliSeconds() {
        return this._dateInMilliSeconds == undefined ? false : this._dateInMilliSeconds;
    }
    set dateInMilliSeconds(val) {
        this._dateInMilliSeconds = val;
    }
    /**
     * Creates an instance of Schema.
     *
     */
    constructor() {
        if (!Schema.schema) {
            // initialize the 'singleton'
            Schema.schema = this;
            this.mapNameToTable = new Map();
        }
        return Schema.schema;
    }
    /**
     * lookup table definition for given table name
     *
     * @param name - The name of the table
     * @returns The table definition or undefined
     */
    hasTable(name) {
        return this.mapNameToTable.get(qualifiySchemaIdentifier(name));
    }
    /**
     * get a table definition
     *
     * @param name - The name of the table
     * @returns The table definition
     */
    getTable(name) {
        const table = this.mapNameToTable.get(qualifiySchemaIdentifier(name));
        if (!table) {
            throw new Error(`table '${name}' not registered yet`);
        }
        return table;
    }
    /**
     * add a table definition
     *
     * @param table - The table definition
     * @returns The table definition
     */
    getOrAddTable(name, opts) {
        const qname = qualifiySchemaIdentifier(name);
        let table = this.mapNameToTable.get(qname);
        if (!table) {
            table = new Table(name);
            this.mapNameToTable.set(qname, table);
            if (opts.withoutRowId != undefined) {
                table.withoutRowId = opts.withoutRowId;
            }
            if (opts.autoIncrement != undefined) {
                table.autoIncrement = opts.autoIncrement;
            }
        }
        else {
            if (opts.withoutRowId != undefined) {
                if (table.isWithoutRowIdDefined && opts.withoutRowId != table.withoutRowId) {
                    throw new Error(`conflicting withoutRowId settings: new: ${opts.withoutRowId}, old ${table.withoutRowId}`);
                }
                table.withoutRowId = opts.withoutRowId;
            }
            if (opts.autoIncrement != undefined) {
                if (table.isAutoIncrementDefined && opts.autoIncrement != table.autoIncrement) {
                    throw new Error(`conflicting autoIncrement settings: new: ${opts.autoIncrement}, old ${table.autoIncrement}`);
                }
                table.autoIncrement = opts.autoIncrement;
            }
        }
        return table;
    }
    /**
     * delete a table definition
     *
     * @param table - The table definition
     */
    deleteTable(name) {
        this.mapNameToTable.delete(qualifiySchemaIdentifier(name));
    }
    /**
     * get array of table definitions
     *
     * @returns The table definitions
     */
    getAllTables() {
        return Array.from(this.mapNameToTable.values());
    }
    /**
     * create a table in the database
     *
     * @param sqldb - The db connection
     * @param name - The name of the table
     * @returns A promise
     */
    createTable(sqldb, name, force) {
        const table = this.getTable(name);
        return sqldb.exec(table.getCreateTableStatement(force));
    }
    /**
     * drop a table from the database
     *
     * @param sqldb - The db connection
     * @param name - The name of the table
     * @returns A promise
     */
    dropTable(sqldb, name) {
        const table = this.getTable(name);
        return sqldb.exec(table.getDropTableStatement());
    }
    /**
     * add a column/field to a database table
     *
     * @param sqldb - The db connection
     * @param tableName - The name of the table
     * @param colName - The name of the column
     * @returns A promise
     */
    alterTableAddColumn(sqldb, tableName, colName) {
        const table = this.getTable(tableName);
        return sqldb.exec(table.getAlterTableAddColumnStatement(colName));
    }
    /**
     * create an index in the database
     *
     * @param sqldb - The db connection
     * @param tableName - The name of the table
     * @param idxName - The name of the index
     * @param [unique] - create unique index
     * @returns A promise
     */
    createIndex(sqldb, tableName, idxName, unique) {
        const table = this.getTable(tableName);
        return sqldb.exec(table.getCreateIndexStatement(idxName, unique));
    }
    /**
     * drop a table from the database
     *
     * @param sqldb - The db connection
     * @param tableName - The name of the table
     * @param idxName - The name of the index
     * @returns A promise
     */
    dropIndex(sqldb, tableName, idxName) {
        const table = this.getTable(tableName);
        return sqldb.exec(table.getDropIndexStatement(idxName));
    }
}
/**
 * get the Schema singleton
 *
 * @export
 * @returns {Schema}
 */
export function schema() {
    if (!Schema.schema) {
        new Schema();
    }
    return Schema.schema;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZW1hLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvU2NoZW1hLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxrQ0FBa0M7QUFHbEMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHOUQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxNQUFNO0lBQ2pCOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFTO0lBRVosY0FBYyxDQUFzQjtJQUU3QyxtQkFBbUIsQ0FBVztJQUN0QyxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xGLENBQUM7SUFDRCxJQUFJLGtCQUFrQixDQUFDLEdBQVk7UUFDakMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0g7UUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25CLDZCQUE2QjtZQUM3QixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUVyQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQ2pELENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUksUUFBUSxDQUFDLElBQVk7UUFDMUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7Ozs7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