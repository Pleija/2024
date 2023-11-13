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