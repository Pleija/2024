import * as _dbg from 'debug';
import { SQL_OPEN_DEFAULT, SqlDatabase } from './SqlDatabase.mjs';
var Database = CS.SqlCipher4Unity3D.Database;
const debug = _dbg('sqlite3orm:database');
export class SqlConnectionPoolDatabase extends SqlDatabase {
    pool;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL2NvcmUvU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxPQUFPLENBQUM7QUFJOUIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxFLElBQU8sUUFBUSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFFMUMsTUFBTSxPQUFPLHlCQUEwQixTQUFRLFdBQVc7SUFDeEQsSUFBSSxDQUFxQjtJQUVsQixLQUFLO1FBQ1YsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsSUFBSSxDQUNmLFlBQW9CLEVBQ3BCLElBQWEsRUFDYixRQUE4QjtRQUU5QiwwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNsQiwwQkFBMEI7WUFDMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2QscUJBQXFCO2dCQUNyQixxREFBcUQ7Z0JBQ3JELDZCQUE2QjtnQkFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLE1B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