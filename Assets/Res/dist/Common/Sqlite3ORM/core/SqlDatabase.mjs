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
    static lastId = 0;
    db;
    dbId;
    databaseFile;
    dirty;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsRGF0YWJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9jb3JlL1NxbERhdGFiYXNlLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5REFBeUQ7QUFDekQsc0VBQXNFO0FBQ3RFLHVEQUF1RDtBQUN0RCxxQ0FBcUM7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUMxQixXQUFXO0FBQ1gsY0FBYztBQUNkLGlCQUFpQjtBQUNqQix1QkFBdUI7QUFDdkIsbUJBQW1CO0FBQ25CLG9CQUFvQjtBQUNwQixzQkFBc0I7QUFDdEIsY0FBYztBQUNkLDJCQUEyQjtBQUMzQixvQkFBb0I7QUFDcEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRzVDLE9BQU8sRUFBZ0IsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEUsSUFBTyxRQUFRLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztBQUVoRCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFDakQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUM7QUFDbkQsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQztBQUU3QyxpRUFBaUU7QUFDakUsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQztBQUN2QyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQztBQUN2RCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxtQkFBbUIsQ0FBQztBQUV6RCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUM7QUFFekMsNkNBQTZDO0FBQzdDLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQztBQUNoRCxN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