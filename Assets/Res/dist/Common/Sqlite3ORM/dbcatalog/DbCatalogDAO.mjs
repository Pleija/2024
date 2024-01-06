/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQL_DEFAULT_SCHEMA } from '../core/index.mjs';
import { FKDefinition } from '../metadata/index.mjs';
import { quoteSimpleIdentifier, splitSchemaIdentifier } from '../utils/index.mjs';
export class DbCatalogDAO {
    sqldb;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGJDYXRhbG9nREFPLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vZGJjYXRhbG9nL0RiQ2F0YWxvZ0RBTy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsdURBQXVEO0FBQ3ZELE9BQU8sRUFBRSxrQkFBa0IsRUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQVVsRixNQUFNLE9BQU8sWUFBWTtJQUN2QixLQUFLLENBQWM7SUFFbkIsWUFBWSxLQUFrQjtRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDekQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzQyxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBa0I7UUFDM0IsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUMsS0FBSzthQUNkLEdBQUcsQ0FBQyxpQkFBaUIsZ0JBQWdCLG1DQUFtQyxDQUFDO2FBQ3pFLElBQUksQ0FBQyxD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