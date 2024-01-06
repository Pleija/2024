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
    static defaults;
    sqldb;
    catalogDao;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b1VwZ3JhZGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vQXV0b1VwZ3JhZGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzRUFBc0U7QUFDdEUsdURBQXVEO0FBQ3ZELHlEQUF5RDtBQUN6RCxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUc5QixPQUFPLEVBQUUsWUFBWSxFQUFlLE1BQU0sdUJBQXVCLENBQUM7QUFDbEUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFTLE1BQU0sc0JBQXNCLENBQUM7QUFDMUUsT0FBTyxFQUVMLHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsYUFBYSxHQUNkLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFPN0MsTUFBTSxDQUFOLElBQVksV0FLWDtBQUxELFdBQVksV0FBVztJQUNyQixpREFBVSxDQUFBO0lBQ1YsaURBQVUsQ0FBQTtJQUNWLCtDQUFLLENBQUE7SUFDTCxxREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUxXLFdBQVcsS0FBWCxXQUFXLFFBS3RCO0FBUUQsTUFBTSxPQUFPLFlBQVk7SUFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBa0I7SUFFaEIsS0FBSyxDQUFjO0lBQ25CLFVBQVUsQ0FBZTtJQUUxQyxZQUFZLEtBQWtCO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsMEJBQTBCO0lBQzFCLGdCQUFnQixDQUFDLElBQXFCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLEVBQUUs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