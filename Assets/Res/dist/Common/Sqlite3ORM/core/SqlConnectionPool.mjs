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
}
SqlConnectionPool.openNamedPools = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQ29ubmVjdGlvblBvb2wubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9jb3JlL1NxbENvbm5lY3Rpb25Qb29sLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUM5QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDNUUsT0FBTyxFQUFtQixnQkFBZ0IsRUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBR25GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXRDOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQWlCNUIsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBQ0QsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsWUFBNEIsT0FBZSxFQUFFO1FBQWpCLFNBQUksR0FBSixJQUFJLENBQWE7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7UUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1FBQ2xELElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQ1IsWUFBb0Is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