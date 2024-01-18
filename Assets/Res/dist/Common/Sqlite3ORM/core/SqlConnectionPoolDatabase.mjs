import * as _dbg from 'debug';
import { SQL_OPEN_DEFAULT, SqlDatabase } from './SqlDatabase.mjs';
var Database = CS.SqlCipher4Unity3D.Database;
const debug = _dbg('sqlite3orm:database');
export class SqlConnectionPoolDatabase extends SqlDatabase {
    close() {
        if (this.pool) {
            return this.pool.release(this);
        }
        else {
            return super.close();
        }
    }
    async open(databaseFile, mode, settings) {
        /* istanbul ignore else */
        if (this.isOpen()) {
            /* istanbul ignore else */
            if (this.pool) {
                // stealing from pool
                // this connection should not be recycled by the pool
                // => temporary mark as dirty
                const oldDirty = this.dirty;
                this.dirty = true;
                await this.pool.release(this);
                this.dirty = oldDirty;
            }
            else {
                await super.close();
            }
        }
        this.pool = undefined;
        return super.open(databaseFile, mode, settings);
    }
    /*
    @internal
    */
    openByPool(pool, databaseFile, mode, settings) {
        return new Promise((resolve, reject) => {
            const db = new Database(databaseFile, mode || SQL_OPEN_DEFAULT, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.pool = pool;
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
    /*
    @internal
    */
    closeByPool() {
        this.pool = undefined;
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
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
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    }
    /*
    @internal
    */
    async recycleByPool(pool, sqldb, settings) {
        /* istanbul ignore else */
        if (sqldb.db) {
            try {
                await sqldb.endTransaction(false);
            }
            catch (err) { }
            sqldb.db.removeAllListeners();
            // move
            this.db = sqldb.db;
            this.dbId = sqldb.dbId;
            this.databaseFile = sqldb.databaseFile;
            this.pool = pool;
            // reapply default settings
            if (settings) {
                try {
                    await this.applySettings(settings);
                }
                catch (err) { }
            }
        }
        sqldb.db = undefined;
        sqldb.dbId = undefined;
        sqldb.databaseFile = undefined;
        sqldb.pool = undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL2NvcmUvU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxPQUFPLENBQUM7QUFJOUIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxFLElBQU8sUUFBUSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFFMUMsTUFBTSxPQUFPLHlCQUEwQixTQUFRLFdBQVc7SUFHakQsS0FBSztRQUNWLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FDZixZQUFvQixFQUNwQixJQUFhLEVBQ2IsUUFBOEI7UUFFOUIsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDbEIsMEJBQTBCO1lBQzFCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNkLHFCQUFxQjtnQkFDckIscURBQXFEO2dCQUNyRCw2QkFBNkI7Z0JBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixNQUFNLElBQUksQ0FBQyxJQUFJ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