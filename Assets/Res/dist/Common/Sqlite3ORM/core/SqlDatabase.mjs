/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as _dbg from 'debug.mjs';
const debug = console.log;
// import {
//   Database,
//   OPEN_CREATE,
//   OPEN_PRIVATECACHE,
//   OPEN_READONLY,
//   OPEN_READWRITE,
//   OPEN_SHAREDCACHE,
//   OPEN_URI,
//   verbose as sqlverbose,
// } from 'sqlite3';
import { SqlBackup } from './SqlBackup.mjs';
import { SqlStatement } from "./SqlStatement.mjs";
var Database = CS.SqlCipher4Unity3D.Database;
export const SQL_OPEN_READONLY = "OPEN_READONLY";
export const SQL_OPEN_READWRITE = "OPEN_READWRITE";
export const SQL_OPEN_CREATE = "OPEN_CREATE";
// introduced by https://github.com/mapbox/node-sqlite3/pull/1078
export const SQL_OPEN_URI = "OPEN_URI";
export const SQL_OPEN_SHAREDCACHE = "OPEN_SHAREDCACHE";
export const SQL_OPEN_PRIVATECACHE = "OPEN_PRIVATECACHE";
export const SQL_DEFAULT_SCHEMA = 'main';
// see https://www.sqlite.org/inmemorydb.html
export const SQL_MEMORY_DB_PRIVATE = ':memory:';
export const SQL_MEMORY_DB_SHARED = 'file:sqlite3orm?mode=memory&cache=shared';
// const debug = _dbg('sqlite3orm:database');
export const SQL_OPEN_DEFAULT_URI = "SQL_OPEN_READWRITE | SQL_OPEN_CREATE | SQL_OPEN_URI";
export const SQL_OPEN_DEFAULT_NO_URI = "SQL_OPEN_READWRITE | SQL_OPEN_CREATE";
export const SQL_OPEN_DEFAULT = SQL_OPEN_DEFAULT_NO_URI; // TODO: Breaking Change: change to 'SQL_OPEN_DEFAULT_URI'
/**
 * A thin wrapper for the 'Database' class from 'node-sqlite3' using Promises
 * instead of callbacks
 * see
 * https://github.com/mapbox/node-sqlite3/wiki/API
 *
 * see why we may want to have a connection pool running on nodejs serving multiple requests
 * https://github.com/mapbox/node-sqlite3/issues/304
 *
 * @export
 * @class SqlDatabase
 */
export class SqlDatabase {
    /**
     * Open a database connection
     *
     * @param databaseFile - The path to the database file or URI
     * @param [mode=SQL_OPEN_DEFAULT] - A bit flag combination of: SQL_OPEN_CREATE |
     * SQL_OPEN_READONLY | SQL_OPEN_READWRITE
     * @returns A promise
     */
    open(databaseFile, mode, settings) {
        return new Promise((resolve, reject) => {
            const db = new Database(databaseFile, mode || SQL_OPEN_DEFAULT, (err) => {
                if (err) {
                    debug(`opening connection to ${databaseFile} failed: ${err.message}`);
                    reject(err);
                }
                else {
                    this.db = db;
                    this.dbId = SqlDatabase.lastId++;
                    this.databaseFile = databaseFile;
                    debug(`${this.dbId}: opened`);
                    resolve();
                }
            });
        }).then(() => {
            if (settings) {
                return this.applySettings(settings);
            }
            return Promise.resolve();
        });
    }
    /**
     * Close the database connection
     *
     * @returns {Promise<void>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
            }
            else {
                const db = this.db;
                debug(`${this.dbId}: close`);
                this.db = undefined;
                this.dbId = undefined;
                this.databaseFile = undefined;
                db.close((err) => {
                    db.removeAllListeners();
                    /* istanbul ignore if */
                    if (err) {
                        debug(`closing connection failed: ${err.message}`);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    }
    /**
     * Test if a connection is open
     *
     * @returns {boolean}
     */
    isOpen() {
        return !!this.db;
    }
    /**
     * Runs a SQL statement with the specified parameters
     *
     * @param sql - The SQL statment
     * @param [params] - The parameters referenced in the statement; you can
     * provide multiple parameters as array
     * @returns A promise
     */
    run(sql, params) {
        return new Promise((resolve, reject) => {
            // trace('run stmt=' + sql);
            // trace('>input: ' + JSON.stringify(params));
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            this.db.run(sql, params, function (err) {
                // do not use arrow function for this callback
                // the below 'this' does not reference ourself
                if (err) {
                    debug(`${self.dbId}: failed sql: ${err.message}
${sql}\nparams: `, params);
                    reject(err);
                }
                else {
                    const res = { lastID: this.lastID, changes: this.changes };
                    resolve(res);
                }
            });
        });
    }
    /**
     * Runs a SQL query with the specified parameters, fetching only the first row
     *
     * @param sql - The DQL statement
     * @param [params] - The parameters referenced in the statement; you can
     * provide multiple parameters as array
     * @returns A promise
     */
    get(sql, params) {
        return new Promise((resolve, reject) => {
            // trace('get stmt=' + sql);
            // trace('>input: ' + JSON.stringify(params));
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    debug(`${this.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    // trace('>succeeded: ' + JSON.stringify(row));
                    resolve(row);
                }
            });
        });
    }
    /**
     * Runs a SQL query with the specified parameters, fetching all rows
     *
     * @param sql - The DQL statement
     * @param [params] - The parameters referenced in the statement; you can
     * provide multiple parameters as array
     * @returns A promise
     */
    all(sql, params) {
        return new Promise((resolve, reject) => {
            // trace('all stmt=' + sql);
            // trace('>input: ' + JSON.stringify(params));
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    debug(`${this.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    // trace('>succeeded: ' + JSON.stringify(rows));
                    resolve(rows);
                }
            });
        });
    }
    /**
     * Runs a SQL query with the specified parameters, fetching all rows
     * using a callback for each row
     *
     * @param sql - The DQL statement
     * @param [params] - The parameters referenced in the statement; you can
     * provide multiple parameters as array
     * @param [callback] - The callback function
     * @returns A promise
     */
    each(sql, params, callback) {
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            this.db.each(sql, params, callback, (err, count) => {
                if (err) {
                    debug(`${this.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    resolve(count);
                }
            });
        });
    }
    /**
     * Execute a SQL statement
     *
     * @param sql - The SQL statement
     * @returns A promise
     */
    exec(sql) {
        return new Promise((resolve, reject) => {
            // trace('exec stmt=' + sql);
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            this.db.exec(sql, (err) => {
                if (err) {
                    debug(`${this.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Prepare a SQL statement
     *
     * @param sql - The SQL statement
     * @param [params] - The parameters referenced in the statement; you can
     * provide multiple parameters as array
     * @returns A promise
     */
    prepare(sql, params) {
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            const dbstmt = this.db.prepare(sql, params, (err) => {
                if (err) {
                    debug(`${this.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    resolve(new SqlStatement(dbstmt));
                }
            });
        });
    }
    /**
     * serialized sqlite3 calls
     * if callback is provided, run callback in serialized mode
     * otherwise, switch connection to serialized mode
     *
     * @param [callback]
     */
    serialize(callback) {
        /* istanbul ignore if */
        if (!this.db) {
            throw new Error('database connection not open');
        }
        return this.db.serialize(callback);
    }
    /**
     * parallelized sqlite3 calls
     * if callback is provided, run callback in parallel mode
     * otherwise, switch connection to parallel mode
     *
     * @param [callback]
     */
    parallelize(callback) {
        /* istanbul ignore if */
        if (!this.db) {
            throw new Error('database connection not open');
        }
        return this.db.parallelize(callback);
    }
    /**
     * Run callback inside a database transaction
     *
     * @param [callback]
     */
    transactionalize(callback) {
        return this.beginTransaction()
            .then(callback)
            .then((res) => this.commitTransaction().then(() => Promise.resolve(res)))
            .catch((err) => this.rollbackTransaction().then(() => Promise.reject(err)));
    }
    beginTransaction() {
        return this.run('BEGIN IMMEDIATE TRANSACTION');
    }
    commitTransaction() {
        return this.run('COMMIT TRANSACTION');
    }
    rollbackTransaction() {
        return this.run('ROLLBACK TRANSACTION');
    }
    endTransaction(commit) {
        // TODO: node-sqlite3 does not yet support `sqlite3_txn_state`
        //   please see https://www.sqlite.org/draft/c3ref/txn_state.html
        // we would need this do test if a transaction is open
        // so we cannot use commitTransaction/rollbackTransaction which would error if no transaction is open
        const sql = commit ? `COMMIT TRANSACTION` : `ROLLBACK TRANSACTION`;
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            debug(`${this.dbId}: sql: ${sql}`);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            this.db.run(sql, undefined, function (err) {
                // do not use arrow function for this callback
                // the below 'this' does not reference ourself
                /* istanbul ignore if */
                if (err && !err.message.includes('no transaction')) {
                    debug(`${self.dbId}: failed sql: ${err.message}
${sql}`);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * initiate online backup
     *
     * @param database - the database file to backup from or to
     * @param databaseIsDestination - if the provided database parameter is source or destination of the backup
     * @param destName - the destination name
     * @param sourceName - the source name
     * @returns A promise
     */
    backup(database /* | SqlDatabase */, databaseIsDestination = true, destName = 'main', sourceName = 'main') {
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
            if (!this.db) {
                reject(new Error('database connection not open'));
                return;
            }
            // TODO(Backup API): typings not yet available
            const db = this.db;
            const backup = db.backup(database, 
            // TODO: jsdoc for Database#backup seems to be wrong; `sourceName` and` destName` are probably swapped
            // please see upstream issue: https://github.com/mapbox/node-sqlite3/issues/1482#issuecomment-903233196
            // swapping again:
            destName, sourceName, databaseIsDestination, (err) => {
                /* istanbul ignore if */
                if (err) {
                    debug(`${this.dbId}: backup init failed for '${database}': ${err.message}`);
                    reject(err);
                }
                else {
                    resolve(new SqlBackup(backup));
                }
            });
        });
    }
    /**
     *
     *
     * @param event
     * @param listener
     */
    on(event, listener) {
        /* istanbul ignore if */
        if (!this.db) {
            throw new Error('database connection not open');
        }
        this.db.on(event, listener);
        return this;
    }
    /**
     * Get the 'user_version' from the database
     * @returns A promise of the user version number
     */
    getUserVersion() {
        return this.get('PRAGMA user_version').then((res) => res.user_version);
    }
    /**
     * Set the 'user_version' in the database
     *
     * @param newver
     * @returns A promise
     */
    setUserVersion(newver) {
        return this.exec(`PRAGMA user_version = ${newver}`);
    }
    /**
     * Get the 'cipher_version' from the database
     * @returns A promise of the cipher version
     */
    getCipherVersion() {
        return this.get('PRAGMA cipher_version').then((res) => 
        /* istanbul ignore next */ res ? res.cipher_version : undefined);
    }
    applySettings(settings) {
        /* istanbul ignore if */
        if (!this.db) {
            return Promise.reject(new Error('database connection not open'));
        }
        const promises = [];
        try {
            /* istanbul ignore if */
            if (settings.cipherCompatibility) {
                this._addPragmaSetting(promises, 'cipher_compatibility', settings.cipherCompatibility);
            }
            /* istanbul ignore if */
            if (settings.key) {
                this._addPragmaSetting(promises, 'key', settings.key);
            }
            /* istanbul ignore else */
            if (settings.journalMode) {
                this._addPragmaSchemaSettings(promises, 'journal_mode', settings.journalMode);
            }
            /* istanbul ignore else */
            if (settings.busyTimeout) {
                this._addPragmaSetting(promises, 'busy_timeout', settings.busyTimeout);
            }
            /* istanbul ignore else */
            if (settings.synchronous) {
                this._addPragmaSchemaSettings(promises, 'synchronous', settings.synchronous);
            }
            /* istanbul ignore else */
            if (settings.caseSensitiveLike) {
                this._addPragmaSetting(promises, 'case_sensitive_like', settings.caseSensitiveLike);
            }
            /* istanbul ignore else */
            if (settings.foreignKeys) {
                this._addPragmaSetting(promises, 'foreign_keys', settings.foreignKeys);
            }
            /* istanbul ignore else */
            if (settings.ignoreCheckConstraints) {
                this._addPragmaSetting(promises, 'ignore_check_constraints', settings.ignoreCheckConstraints);
            }
            /* istanbul ignore else */
            if (settings.queryOnly) {
                this._addPragmaSetting(promises, 'query_only', settings.queryOnly);
            }
            /* istanbul ignore else */
            if (settings.readUncommitted) {
                this._addPragmaSetting(promises, 'read_uncommitted', settings.readUncommitted);
            }
            /* istanbul ignore else */
            if (settings.recursiveTriggers) {
                this._addPragmaSetting(promises, 'recursive_triggers', settings.recursiveTriggers);
            }
            /* istanbul ignore else */
            if (settings.secureDelete) {
                this._addPragmaSchemaSettings(promises, 'secure_delete', settings.secureDelete);
            }
            if (settings.executionMode) {
                switch (settings.executionMode.toUpperCase()) {
                    case 'SERIALIZE':
                        this.serialize();
                        break;
                    case 'PARALLELIZE':
                        this.parallelize();
                        break;
                    default:
                        throw new Error(`failed to read executionMode setting: ${settings.executionMode.toString()}`);
                }
            }
            else {
                this.parallelize();
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        if (promises.length) {
            return Promise.all(promises).then(() => { });
        }
        return Promise.resolve();
    }
    _addPragmaSchemaSettings(promises, pragma, setting) {
        if (Array.isArray(setting)) {
            setting.forEach((val) => {
                this._addPragmaSetting(promises, pragma, val, true);
            });
        }
        else {
            this._addPragmaSetting(promises, pragma, setting, true);
        }
    }
    _addPragmaSetting(promises, pragma, setting, schemaSupport = false) {
        if (typeof setting === 'number') {
            promises.push(this.exec(`PRAGMA ${pragma} = ${setting}`));
            return;
        }
        if (schemaSupport) {
            const splitted = setting.split('.');
            switch (splitted.length) {
                case 1:
                    promises.push(this.exec(`PRAGMA ${pragma} = ${setting.toUpperCase()}`));
                    return;
                case 2:
                    promises.push(this.exec(`PRAGMA ${splitted[0]}.${pragma} = ${splitted[1].toUpperCase()}`));
                    return;
            }
            throw new Error(`failed to read ${pragma} setting: ${setting.toString()}`);
        }
        else {
            promises.push(this.exec(`PRAGMA ${pragma} = ${setting}`));
        }
    }
    /**
     * Set the execution mode to verbose to produce long stack traces. There is no way to reset this.
     * See https://github.com/mapbox/node-sqlite3/wiki/Debugging
     *
     * @param newver
     */
    static verbose() {
        //sqlverbose();
        Database.verbose();
    }
}
SqlDatabase.lastId = 0;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsRGF0YWJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9jb3JlL1NxbERhdGFiYXNlLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5REFBeUQ7QUFDekQsc0VBQXNFO0FBQ3RFLHVEQUF1RDtBQUN0RCxxQ0FBcUM7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUMxQixXQUFXO0FBQ1gsY0FBYztBQUNkLGlCQUFpQjtBQUNqQix1QkFBdUI7QUFDdkIsbUJBQW1CO0FBQ25CLG9CQUFvQjtBQUNwQixzQkFBc0I7QUFDdEIsY0FBYztBQUNkLDJCQUEyQjtBQUMzQixvQkFBb0I7QUFDcEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRzVDLE9BQU8sRUFBZ0IsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEUsSUFBTyxRQUFRLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztBQUVoRCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFDakQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUM7QUFDbkQsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQztBQUU3QyxpRUFBaUU7QUFDakUsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQztBQUN2QyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQztBQUN2RCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxtQkFBbUIsQ0FBQztBQUV6RCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUM7QUFFekMsNkNBQTZDO0FBQzdDLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQztBQUNoRCxN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