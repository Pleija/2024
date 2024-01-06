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