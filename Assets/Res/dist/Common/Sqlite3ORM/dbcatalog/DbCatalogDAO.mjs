/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQL_DEFAULT_SCHEMA } from '../core/index.mjs';
import { FKDefinition } from '../metadata/index.mjs';
import { quoteSimpleIdentifier, splitSchemaIdentifier } from '../utils/index.mjs';
export class DbCatalogDAO {
    constructor(sqldb) {
        this.sqldb = sqldb;
    }
    readSchemas() {
        const schemas = [];
        return this.sqldb.all(`PRAGMA database_list`).then((res) => {
            res.forEach((db) => schemas.push(db.name));
            return schemas;
        });
    }
    readTables(schemaName) {
        const tables = [];
        const quotedSchemaName = quoteSimpleIdentifier(schemaName);
        return this.sqldb
            .all(`select * from ${quotedSchemaName}.sqlite_master where type='table'`)
            .then((res) => {
            res.forEach((tab) => tables.push(tab.name));
            return tables;
        });
    }
    async readTableInfo(tableName, schemaName) {
        try {
            const { identName, identSchema } = splitSchemaIdentifier(tableName);
            tableName = identName;
            schemaName = identSchema || schemaName || SQL_DEFAULT_SCHEMA;
            const quotedName = quoteSimpleIdentifier(tableName);
            const quotedSchema = quoteSimpleIdentifier(schemaName);
            // TODO: sqlite3 issue regarding schema queries from multiple connections
            // The result of table_info seems to be somehow cached, so subsequent calls to table_info may return wrong results
            // The scenario where this problem was detected:
            //    connection 1:   PRAGMA table_info('FOO_TABLE') => ok (no data)
            //    connection 2:   PRAGMA table_info('FOO_TABLE') => ok (no data)
            //    connection 2:   CREATE TABLE FOO_TABLE (...)
            //    connection 3:   PRAGMA table_info('FOO_TABLE') => ok (data)
            //    connection 2:   PRAGMA table_info('FOO_TABLE') => ok (data)
            //    connection 1:   PRAGMA table_info('FOO_TABLE') => NOT OK (NO DATA)
            // known workarounds:
            //    1) perform all schema discovery and schema modifications from the same connection
            //    2) if using a connection pool, do not recycle a connection after performing schema queries
            //    3) not verified yet: using shared cache
            //  workaround for issue described above (required by e.g 'loopback-connector-sqlite3x')
            this.sqldb.dirty = true;
            const tableInfo = await this.callSchemaQueryPragma('table_info', quotedName, quotedSchema);
            if (tableInfo.length === 0) {
                return undefined;
            }
            const idxList = await this.callSchemaQueryPragma('index_list', quotedName, quotedSchema);
            const fkList = await this.callSchemaQueryPragma('foreign_key_list', quotedName, quotedSchema);
            const info = {
                name: `${schemaName}.${tableName}`,
                tableName,
                schemaName,
                columns: {},
                primaryKey: [],
                indexes: {},
                foreignKeys: {},
            };
            tableInfo
                .sort((colA, colB) => colA.pk - colB.pk)
                .forEach((col) => {
                const colInfo = {
                    name: col.name,
                    type: col.type,
                    typeAffinity: DbCatalogDAO.getTypeAffinity(col.type),
                    notNull: !!col.notnull,
                    defaultValue: col.dflt_value,
                };
                info.columns[col.name] = colInfo;
                if (col.pk) {
                    info.primaryKey.push(col.name);
                }
            });
            if (info.primaryKey.length === 1 &&
                info.columns[info.primaryKey[0]].typeAffinity === 'INTEGER') {
                // dirty hack to check if this column is autoincrementable
                // not checked: if autoincrement is part of column/index/foreign key name
                // not checked: if autoincrement is part of default literal text
                // however, test is sufficient for autoupgrade
                const schema = quotedSchema || '"main"';
                const res = await this.sqldb.all(`select * from ${schema}.sqlite_master where type='table' and name=:tableName and UPPER(sql) like '%AUTOINCREMENT%'`, { ':tableName': tableName });
                if (res && res.length === 1) {
                    info.autoIncrement = true;
                }
            }
            const promises = [];
            idxList.forEach((idx) => {
                if (idx.origin !== 'pk') {
                    promises.push(new Promise((resolve, reject) => {
                        const idxInfo = {
                            name: idx.name,
                            unique: !!idx.unique,
                            partial: !!idx.partial,
                            columns: [],
                        };
                        this.callSchemaQueryPragma('index_xinfo', quoteSimpleIdentifier(idx.name), quotedSchema)
                            .then((xinfo) => {
                            xinfo
                                .sort((idxColA, idxColB) => idxColA.seqno - idxColB.seqno)
                                .forEach((idxCol) => {
                                if (idxCol.cid >= 0) {
                                    const idxColInfo = {
                                        name: idxCol.name,
                                        desc: !!idxCol.desc,
                                        coll: idxCol.coll,
                                        key: !!idxCol.key,
                                    };
                                    idxInfo.columns.push(idxColInfo);
                                }
                            });
                            return idxInfo;
                        })
                            .then((val) => resolve(val))
                            .catch(/* istanbul ignore next */ (err) => reject(err));
                    }));
                }
            });
            const indexInfos = await Promise.all(promises);
            indexInfos.forEach((idxInfo) => {
                info.indexes[idxInfo.name] = idxInfo;
            });
            // NOTE: because we are currently not able to discover the FK constraint name
            // (not reported by 'foreign_key_list' pragma)
            // we are currently using a 'genericForeignKeyId' here, which is readable, but does not look like an identifier
            let lastId;
            let lastFk;
            let fromCols = [];
            let toCols = [];
            fkList
                .sort((fkA, fkB) => fkA.id * 1000 + fkA.seq - (fkB.id * 1000 + fkB.seq))
                .forEach((fk) => {
                if (lastId === fk.id) {
                    // continue
                    fromCols.push(fk.from);
                    toCols.push(fk.to);
                }
                else {
                    // old fk
                    if (lastFk) {
                        const fkInfo = {
                            refTable: lastFk.table,
                            columns: fromCols,
                            refColumns: toCols,
                        };
                        info.foreignKeys[FKDefinition.genericForeignKeyId(fromCols, lastFk.table, toCols)] = fkInfo;
                    }
                    // new fk
                    lastId = fk.id;
                    lastFk = fk;
                    fromCols = [];
                    toCols = [];
                    fromCols.push(fk.from);
                    toCols.push(fk.to);
                }
            });
            if (lastFk) {
                const fkInfo = {
                    refTable: lastFk.table,
                    columns: fromCols,
                    refColumns: toCols,
                };
                info.foreignKeys[FKDefinition.genericForeignKeyId(fromCols, lastFk.table, toCols)] = fkInfo;
            }
            return info;
        }
        catch (err) {
            /* istanbul ignore next */
            return Promise.reject(err);
        }
    }
    callSchemaQueryPragma(pragmaName, identifierName, identifierSchema) {
        return this.sqldb.all(`PRAGMA ${identifierSchema}.${pragmaName}(${identifierName})`);
    }
    static getTypeAffinity(typeDef) {
        const type = typeDef.toUpperCase();
        if (type.indexOf('INT') !== -1) {
            return 'INTEGER';
        }
        const textMatches = /(CHAR|CLOB|TEXT)/.exec(type);
        if (textMatches) {
            return 'TEXT';
        }
        if (type.indexOf('BLOB') !== -1) {
            return 'BLOB';
        }
        const realMatches = /(REAL|FLOA|DOUB)/.exec(type);
        if (realMatches) {
            return 'REAL';
        }
        return 'NUMERIC';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJDYXRhbG9nREFPLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vZGJjYXRhbG9nL0RiQ2F0YWxvZ0RBTy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsdURBQXVEO0FBQ3ZELE9BQU8sRUFBRSxrQkFBa0IsRUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQVVsRixNQUFNLE9BQU8sWUFBWTtJQUd2QixZQUFZLEtBQWtCO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxXQUFXO1FBQ1QsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBQzdCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN6RCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFVBQVUsQ0FBQyxVQUFrQjtRQUMzQixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxPQUFPLElBQUksQ0FBQyxLQUFLO2FBQ2QsR0FBRyxDQUFDLGlCQUFpQixnQkFBZ0IsbUNBQW1DLENBQUM7YUFDekUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVB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