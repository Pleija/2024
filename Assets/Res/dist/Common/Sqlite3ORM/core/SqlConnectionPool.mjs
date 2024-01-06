import * as _dbg from 'debug';
import { wait } from '../utils/wait.mjs';
import { SqlConnectionPoolDatabase } from './SqlConnectionPoolDatabase.mjs';
import { SQL_OPEN_DEFAULT } from './SqlDatabase.mjs';
const debug = _dbg('sqlite3orm:pool');
/**
 * A simple connection pool
 *
 * @export
 * @class SqlConnectionPool
 */
export class SqlConnectionPool {
    name;
    databaseFile;
    mode;
    min;
    max;
    inPool;
    inUse;
    settings;
    _opening;
    get poolSize() {
        return this.inPool.length;
    }
    get openSize() {
        return this.inUse.size;
    }
    /**
     * Creates an instance of SqlConnectionPool.
     *
     */
    constructor(name = '') {
        this.name = name;
        this.databaseFile = undefined;
        this.mode = SQL_OPEN_DEFAULT;
        this.inUse = new Set();
        this.inPool = [];
        this.min = this.max = 0;
    }
    /**
     * Open a database connection pool
     *
     * @param databaseFile - The path to the database file or URI
     * @param [mode=SQL_OPEN_DEFAULT] - A bit flag combination of: SQL_OPEN_CREATE |
     * SQL_OPEN_READONLY | SQL_OPEN_READWRITE
     * @param [min=1] minimum connections which should be opened by this connection pool
     * @param [max=0] maximum connections which can be opened by this connection pool
     * @returns A promise
     */
    async open(databaseFile, mode = SQL_OPEN_DEFAULT, min = 1, max = 0, settings) {
        if (this._opening) {
            try {
                await this._opening;
                if (this.databaseFile === databaseFile /*&& (mode & ~SQL_OPEN_CREATE) === this.mode*/) {
                    // already opened
                    return;
                }
            }
            catch (err) { }
        }
        this._opening = this.openInternal(databaseFile, mode, min, max, settings);
        try {
            await this._opening;
        }
        catch (err) {
            return Promise.reject(err);
        }
        finally {
            this._opening = undefined;
        }
        return;
    }
    async openInternal(databaseFile, mode = SQL_OPEN_DEFAULT, min = 1, max = 0, settings) {
        try {
            await this.close();
        }
        catch (err) { }
        try {
            this.databaseFile = databaseFile;
            this.mode = mode;
            this.min = min;
            this.max = max;
            this.settings = settings;
            this.inPool.length = 0;
            const promises = [];
            if (this.min < 1) {
                this.min = 1;
            }
            let sqldb = new SqlConnectionPoolDatabase();
            await sqldb.openByPool(this, this.databaseFile, this.mode, this.settings);
            this.inPool.push(sqldb);
            this.mode += "~SQL_OPEN_CREATE";
            for (let i = 1; i < this.min; i++) {
                sqldb = new SqlConnectionPoolDatabase();
                promises.push(sqldb.openByPool(this, this.databaseFile, this.mode, this.settings));
                this.inPool.push(sqldb);
            }
            await Promise.all(promises);
            if (this.name.length) {
                SqlConnectionPool.openNamedPools.set(this.name, this);
            }
            debug(`pool ${this.name}: opened: ${this.inUse.size} connections open (${this.inPool.length} in pool)`);
        }
        catch (err) {
            try {
                await this.close();
            }
            catch (_ignore) { }
            debug(`pool ${this.name}: opening ${databaseFile} failed: ${err.message}`);
            return Promise.reject(err);
        }
    }
    /**
     * Close the database connection pool
     *
     * @returns A promise
     */
    async close() {
        try {
            if (this.databaseFile) {
                if (this.inUse.size) {
                    debug(`pool ${this.name}: closing: forcibly closing ${this.inUse.size} opened connections (${this.inPool.length} in pool)`);
                }
                else {
                    debug(`pool ${this.name}: closing: ${this.inUse.size} connections open (${this.inPool.length} in pool)`);
                }
            }
            if (this.name.length) {
                SqlConnectionPool.openNamedPools.delete(this.name);
            }
            this.databaseFile = undefined;
            this.mode = SQL_OPEN_DEFAULT;
            const promises = [];
            this.inPool.forEach((value) => {
                promises.push(value.closeByPool());
            });
            this.inPool.length = 0;
            this.inUse.forEach((value) => {
                promises.push(value.closeByPool());
            });
            this.inUse.clear();
            await Promise.all(promises);
        }
        catch (err) /* istanbul ignore next */ {
            debug(`pool ${this.name}: closing failed: ${err.message}`);
            return Promise.reject(err);
        }
    }
    /**
     * test if this connection pool is connected to a database file
     */
    isOpen() {
        return !!this.databaseFile;
    }
    /**
     * get a connection from the pool
     *
     * @param [timeout=0] The timeout to wait for a connection ( 0 is infinite )
     * @returns A promise of the db connection
     */
    async get(timeout = 0) {
        try {
            let sqldb;
            const cond = () => this.inPool.length > 0;
            if (this.max > 0 && !cond() && this.inUse.size >= this.max) {
                await wait(cond, timeout);
            }
            if (this.inPool.length > 0) {
                sqldb = this.inPool.shift();
                this.inUse.add(sqldb);
                debug(`pool ${this.name}: ${this.inUse.size} connections open (${this.inPool.length} in pool)`);
                return sqldb;
            }
            if (!this.databaseFile) {
                throw new Error(`connection pool not opened`);
            }
            sqldb = new SqlConnectionPoolDatabase();
            await sqldb.openByPool(this, this.databaseFile, this.mode, this.settings);
            this.inUse.add(sqldb);
            debug(`pool ${this.name}: ${this.inUse.size} connections open (${this.inPool.length} in pool)`);
            return sqldb;
        }
        catch (err) {
            debug(`pool ${this.name}: getting connection from pool failed: ${err.message}`);
            return Promise.reject(err);
        }
    }
    /**
     * release a connection to the pool
     *
     * @param sqldb - The db connection
     */
    async release(sqldb) {
        /* istanbul ignore if */
        if (!(sqldb instanceof SqlConnectionPoolDatabase) || this !== sqldb.pool) {
            // not opened by this pool
            return sqldb.close();
        }
        this.inUse.delete(sqldb);
        /* istanbul ignore else */
        if (sqldb.isOpen()) {
            if (sqldb.dirty || this.inPool.length >= this.min) {
                // close database connection
                await sqldb.closeByPool();
            }
            else {
                // transfer database connection
                const newsqldb = new SqlConnectionPoolDatabase();
                await newsqldb.recycleByPool(this, sqldb, this.settings);
                this.inPool.push(newsqldb);
            }
            debug(`pool ${this.name}: ${this.inUse.size} connections open (${this.inPool.length} in pool)`);
        }
    }
    static openNamedPools = new Map();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQ29ubmVjdGlvblBvb2wubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9jb3JlL1NxbENvbm5lY3Rpb25Qb29sLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUM5QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDNUUsT0FBTyxFQUFtQixnQkFBZ0IsRUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBR25GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXRDOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQTRCQTtJQTNCcEIsWUFBWSxDQUFVO0lBRXRCLElBQUksQ0FBZ0I7SUFFcEIsR0FBRyxDQUFTO0lBRVosR0FBRyxDQUFTO0lBRUgsTUFBTSxDQUE4QjtJQUVwQyxLQUFLLENBQWlDO0lBRS9DLFFBQVEsQ0FBdUI7SUFFL0IsUUFBUSxDQUFpQjtJQUVqQyxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUE0QixPQUFlLEVBQUU7UUFBakIsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7UUFDbEQsSUFBSSxDQUFD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