/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as _dbg from 'debug';
import { DbCatalogDAO } from './dbcatalog/index.mjs';
import { Field, FKDefinition, schema } from './metadata/index.mjs';
import { qualifiySchemaIdentifier, quoteIdentifier, sequentialize, } from './utils/index.mjs';
const debug = _dbg('sqlite3orm:autoupgrade');
export var UpgradeMode;
(function (UpgradeMode) {
    UpgradeMode[UpgradeMode["ACTUAL"] = 0] = "ACTUAL";
    UpgradeMode[UpgradeMode["CREATE"] = 1] = "CREATE";
    UpgradeMode[UpgradeMode["ALTER"] = 2] = "ALTER";
    UpgradeMode[UpgradeMode["RECREATE"] = 3] = "RECREATE";
})(UpgradeMode || (UpgradeMode = {}));
export class AutoUpgrader {
    constructor(sqldb) {
        this.sqldb = sqldb;
        this.catalogDao = new DbCatalogDAO(sqldb);
    }
    /*
     * upgrade all registered tables
     */
    /* istanbul ignore next */
    upgradeAllTables(opts) {
        return this.upgradeTables(schema().getAllTables(), opts);
    }
    /*
     * upgrade specified tables
     */
    async upgradeTables(tables, opts) {
        let fkEnabled;
        let error;
        // set fkEnabled and if foreign key constraints are enabled, disable them
        try {
            fkEnabled = await this.foreignKeyEnabled();
            if (fkEnabled) {
                await this.foreignKeyEnable(false);
            }
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(e);
        }
        // upgrade tables
        try {
            if (Array.isArray(tables)) {
                await sequentialize(tables.map((table) => () => this._upgradeTable(table, opts)));
            }
            else {
                await this._upgradeTable(tables, opts);
            }
        }
        catch (e) {
            error = e;
        }
        // If foreign key constraints were originally enabled, enable them again
        if (fkEnabled) {
            try {
                await this.foreignKeyEnable(true);
            }
            catch (e /* istanbul ignore next */) {
                if (!error) {
                    error = e;
                }
            }
        }
        if (error) {
            return Promise.reject(error);
        }
    }
    isActual(tables, opts) {
        const promises = [];
        if (Array.isArray(tables)) {
            tables.forEach((tab) => {
                promises.push(this.getUpgradeInfo(tab, opts).then((info) => info.upgradeMode === UpgradeMode.ACTUAL));
            });
        }
        else {
            promises.push(this.getUpgradeInfo(tables, opts).then((info) => info.upgradeMode === UpgradeMode.ACTUAL));
        }
        return Promise.all(promises).then((results) => results.reduce((prev, curr) => prev && curr));
    }
    async getUpgradeInfo(table, opts) {
        let tableInfo;
        try {
            tableInfo = await this.catalogDao.readTableInfo(table.name);
        }
        catch (err /* istanbul ignore next */) {
            return Promise.reject(err);
        }
        return this._getUpgradeInfo(table, tableInfo, opts);
    }
    _getUpgradeInfo(table, tableInfo, opts) {
        opts =
            AutoUpgrader.defaults || opts ? Object.assign({}, AutoUpgrader.defaults, opts) : undefined;
        if (!tableInfo) {
            debug(`  does not exist`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.CREATE };
        }
        if (opts && opts.forceRecreate) {
            debug(`  forcing recreate`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
        }
        // test if foreign key definitions are equal, otherwise return UpgradeMode.RECREATE
        if (table.mapNameToFKDef.size !== Object.keys(tableInfo.foreignKeys).length) {
            debug(`  foreign key added or removed`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
        }
        for (const fk of table.mapNameToFKDef.values()) {
            const genName = FKDefinition.genericForeignKeyId(fk.fields.map((f) => f.name), fk.foreignTableName, fk.fields.map((field) => field.foreignColumnName));
            if (!tableInfo.foreignKeys[genName]) {
                debug(`  foreign key definition for '${fk.name}' changed`);
                return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
            }
        }
        // test if no column needs to be dropped, otherwise return UpgradeMode.RECREATE
        const keepOldColumns = opts && opts.keepOldColumns ? true : false;
        let oldColumnsCount = 0;
        for (const colName of Object.keys(tableInfo.columns)) {
            const field = table.mapNameToField.get(colName);
            if (!field) {
                if (!keepOldColumns || tableInfo.columns[colName].notNull) {
                    if (keepOldColumns) {
                        debug(`  column to keep '${colName} as nullable'`);
                    }
                    else {
                        debug(`  column dropped '${colName}'`);
                    }
                    return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
                }
                else {
                    oldColumnsCount += 1;
                    debug(`  column to keep '${colName}'`);
                    continue;
                }
            }
            const newFldDef = Field.parseDbType(field.dbtype);
            if (!newFldDef ||
                newFldDef.typeAffinity !== tableInfo.columns[colName].typeAffinity ||
                newFldDef.notNull !== tableInfo.columns[colName].notNull ||
                newFldDef.defaultValue != tableInfo.columns[colName].defaultValue) {
                debug(`  column changed '${colName}'`);
                // debug(`    old: `, JSON.stringify(tableInfo.columns[colName]));
                // debug(`    new: `, JSON.stringify(newFldDef));
                return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
            }
        }
        // test if primary key columns are equal, otherwise return UpgradeMode.RECREATE
        if (table.mapNameToIdentityField.size !== tableInfo.primaryKey.length) {
            debug(`  primary key column added or removed`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
        }
        let pkIdx = 0;
        for (const fld of table.fields) {
            if (!table.mapNameToIdentityField.has(fld.name)) {
                continue;
            }
            if (fld.name !== tableInfo.primaryKey[pkIdx++]) {
                debug(`  primary key column changed`);
                return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
            }
        }
        // test if autoIncrement is equal, otherwise return UpgradeMode.RECREATE
        if ((table.autoIncrementField && !tableInfo.autoIncrement) ||
            (!table.autoIncrementField && tableInfo.autoIncrement)) {
            debug(`  autoIncrement changed`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.RECREATE };
        }
        // test if no column needs to be added, otherwise return UpgradeMode.ALTER
        if (Object.keys(tableInfo.columns).length - oldColumnsCount !== table.fields.length) {
            debug(`  column(s) added`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.ALTER };
        }
        // test if no index needs to be changed, otherwise return UpgradeMode.ALTER
        if (Object.keys(tableInfo.indexes).length !== table.mapNameToIDXDef.size) {
            debug(`  indexes added or removed`);
            return { tableInfo, opts, upgradeMode: UpgradeMode.ALTER };
        }
        for (const name of Object.keys(tableInfo.indexes)) {
            const idx = table.mapNameToIDXDef.get(qualifiySchemaIdentifier(name, tableInfo.schemaName));
            if (!idx) {
                debug(`  index '${name}' dropped`);
                return { tableInfo, opts, upgradeMode: UpgradeMode.ALTER };
            }
            const oldCols = tableInfo.indexes[name].columns.map((idxCol) => idxCol.name).join(',');
            const newCols = idx.fields.map((fld) => fld.name).join(',');
            if (oldCols !== newCols) {
                debug(`  index '${name}' changed`);
                // debug(`     old: ${oldCols}`);
                // debug(`     new: ${newCols}`);
                return { tableInfo, opts, upgradeMode: UpgradeMode.ALTER };
            }
        }
        return { tableInfo, opts, upgradeMode: UpgradeMode.ACTUAL };
    }
    async _upgradeTable(table, opts) {
        debug(`upgradeTable(${table.name}):`);
        let upgradeInfo;
        try {
            upgradeInfo = await this.getUpgradeInfo(table, opts);
        }
        catch (err /* istanbul ignore next */) {
            return Promise.reject(err);
        }
        switch (upgradeInfo.upgradeMode) {
            case UpgradeMode.ACTUAL:
                return;
            case UpgradeMode.CREATE:
                return this.createTable(table);
            case UpgradeMode.ALTER:
                return this.alterTable(table, upgradeInfo);
            case UpgradeMode.RECREATE:
                return this.recreateTable(table, upgradeInfo);
            /* istanbul ignore next */
            default:
                return Promise.reject(`table '${table.name}': unknown upgrade-mode detected`);
        }
    }
    /*
     * create table and indexes
     */
    createTable(table) {
        const factories = [];
        debug(`  => create table`);
        // create table
        factories.push(() => this.sqldb.exec(table.getCreateTableStatement(true)));
        // create all indexes
        table.mapNameToIDXDef.forEach((idx) => {
            debug(`  => create index '${idx.name}'`);
            factories.push(() => this.sqldb.exec(table.getCreateIndexStatement(idx.name)));
        });
        return sequentialize(factories).then(() => { });
    }
    /*
     * alter table and add missing table colums and indexes
     */
    alterTable(table, upgradeInfo) {
        const tableInfo = upgradeInfo.tableInfo;
        const factories = [];
        debug(`  => alter table`);
        // add missing columns
        table.mapNameToField.forEach((field) => {
            if (!tableInfo.columns[field.name]) {
                debug(`  => alter table add column '${field.name}'`);
                factories.push(() => this.sqldb.exec(table.getAlterTableAddColumnStatement(field.name)));
            }
        });
        // drop indexes
        Object.keys(tableInfo.indexes).forEach((name) => {
            const idx = table.mapNameToIDXDef.get(qualifiySchemaIdentifier(name, tableInfo.schemaName));
            if (!idx) {
                debug(`  => drop index '${name}'`);
                factories.push(() => this.sqldb.exec(`DROP INDEX IF EXISTS ${quoteIdentifier(name)}`));
                delete tableInfo.indexes[name]; // delete to enable re-creation
                return;
            }
            const oldCols = tableInfo.indexes[name].columns.map((idxCol) => idxCol.name).join(',');
            const newCols = idx.fields.map((fld) => fld.name).join(',');
            if (oldCols !== newCols) {
                debug(`  => drop index '${name}' (changed)`);
                // debug(`     oldCols='${oldCols}'`);
                // debug(`     newCols='${newCols}'`);
                factories.push(() => this.sqldb.exec(`DROP INDEX IF EXISTS ${quoteIdentifier(name)}`));
                delete tableInfo.indexes[name]; // delete to enable re-creation
                return;
            }
        });
        // add missing indexes
        table.mapNameToIDXDef.forEach((idx) => {
            if (!tableInfo.indexes[idx.name]) {
                debug(`  => create index '${idx.name}'`);
                factories.push(() => this.sqldb.exec(table.getCreateIndexStatement(idx.name)));
            }
        });
        return sequentialize(factories).then(() => { });
    }
    /*
     * recreate table
     */
    recreateTable(table, upgradeInfo) {
        const tableInfo = upgradeInfo.tableInfo;
        const addFields = [];
        const factories = [];
        debug(`  => recreate table`);
        const keepOldColumns = upgradeInfo.opts && upgradeInfo.opts.keepOldColumns ? true : false;
        if (keepOldColumns) {
            for (const colName of Object.keys(tableInfo.columns)) {
                const field = table.mapNameToField.get(colName);
                if (field) {
                    continue;
                }
                const addField = new Field(colName, false);
                // NOTE: these columns should always be nullable
                addField.dbtype = tableInfo.columns[colName].type;
                const defaultValue = tableInfo.columns[colName].defaultValue;
                if (defaultValue != undefined) {
                    addField.dbtype += ` DEFAULT(${defaultValue.toString()})`;
                }
                addFields.push(addField);
            }
        }
        const tmpTableName = quoteIdentifier(table.name + '_autoupgrade');
        // rename old table
        factories.push(() => this.sqldb.exec(`ALTER TABLE ${table.quotedName} RENAME TO ${tmpTableName}`));
        // create table
        factories.push(() => this.sqldb.exec(table.createCreateTableStatement(true, addFields)));
        // data transfer
        let colNames;
        if (keepOldColumns) {
            colNames = Object.keys(tableInfo.columns)
                .map((colName) => quoteIdentifier(colName))
                .join(',');
        }
        else {
            colNames = Object.keys(tableInfo.columns)
                .filter((colName) => table.mapNameToField.has(colName))
                .map((colName) => quoteIdentifier(colName))
                .join(',');
        }
        const insertStmt = `INSERT INTO ${table.quotedName} (
  ${colNames}
) SELECT
  ${colNames}
FROM  ${tmpTableName}`;
        factories.push(() => this.sqldb.exec(insertStmt));
        // drop old table
        factories.push(() => this.sqldb.exec(`DROP TABLE ${tmpTableName}`));
        // create all indexes
        table.mapNameToIDXDef.forEach((idx) => {
            debug(`  => create index '${idx.name}'`);
            factories.push(() => this.sqldb.exec(table.getCreateIndexStatement(idx.name)));
        });
        return this.sqldb.transactionalize(() => sequentialize(factories).then(() => { }));
    }
    /*
     * get current foreign key enforcement status
     */
    foreignKeyEnabled() {
        return this.sqldb.get('PRAGMA foreign_keys').then((row) => !!row.foreign_keys);
    }
    /*
     * set current foreign key enforcement status
     */
    foreignKeyEnable(enable) {
        const val = enable ? 'TRUE' : 'FALSE';
        return this.sqldb.exec(`PRAGMA foreign_keys = ${val}`);
    }
    static debug(formatter, ...args) {
        debug(formatter, ...args);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b1VwZ3JhZGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vQXV0b1VwZ3JhZGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzRUFBc0U7QUFDdEUsdURBQXVEO0FBQ3ZELHlEQUF5RDtBQUN6RCxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUc5QixPQUFPLEVBQUUsWUFBWSxFQUFlLE1BQU0sdUJBQXVCLENBQUM7QUFDbEUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFTLE1BQU0sc0JBQXNCLENBQUM7QUFDMUUsT0FBTyxFQUVMLHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsYUFBYSxHQUNkLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFPN0MsTUFBTSxDQUFOLElBQVksV0FLWDtBQUxELFdBQVksV0FBVztJQUNyQixpREFBVSxDQUFBO0lBQ1YsaURBQVUsQ0FBQTtJQUNWLCtDQUFLLENBQUE7SUFDTCxxREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUxXLFdBQVcsS0FBWCxXQUFXLFFBS3RCO0FBUUQsTUFBTSxPQUFPLFlBQVk7SUFNdkIsWUFBWSxLQUFrQjtRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7T0FFRztJQUNILDBCQUEwQjtJQUMxQixnQkFBZ0IsQ0FBQyxJQUFxQjtRQUNwQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGFB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