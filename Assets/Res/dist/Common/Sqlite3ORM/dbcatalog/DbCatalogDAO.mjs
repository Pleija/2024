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