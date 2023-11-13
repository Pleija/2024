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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZW1hLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvU2NoZW1hLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxrQ0FBa0M7QUFHbEMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHOUQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxNQUFNO0lBQ2pCOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFTO0lBRVosY0FBYyxDQUFzQjtJQUU3QyxtQkFBbUIsQ0FBVztJQUN0QyxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xGLENBQUM7SUFDRCxJQUFJLGtCQUFrQixDQUFDLEdBQVk7UUFDakMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0g7UUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNsQiw2QkFBNkI7WUFDN0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFFckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztTQUNoRDtRQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFFSSxRQUFRLENBQUMsSUFBWTtRQUMxQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ks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