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