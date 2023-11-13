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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL2NvcmUvU3FsQ29ubmVjdGlvblBvb2xEYXRhYmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxPQUFPLENBQUM7QUFJOUIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxFLElBQU8sUUFBUSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFFMUMsTUFBTSxPQUFPLHlCQUEwQixTQUFRLFdBQVc7SUFDeEQsSUFBSSxDQUFxQjtJQUVsQixLQUFLO1FBQ1YsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQzthQUFNO1lBQ0wsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FDZixZQUFvQixFQUNwQixJQUFhLEVBQ2IsUUFBOEI7UUFFOUIsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pCLDBCQUEwQjtZQUMxQixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IscUJBQXFCO2dCQUNyQixxREFBcUQ7Z0JBQ3JELDZCQUE2QjtnQkFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNMLE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3JCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUN0QixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7O01BRUU7SUFDSyxVQUFVLENBQ2YsSUFBdUIsRUFDdkIsWUFBb0IsRUFDcEIsSUFBb0IsRUFDcEIsUUFBOEI7UUFFOUIsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzQyxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLGdCQUFnQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ3RFLElBQUksR0FBRyxFQUFFO29CQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDakIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7b0JBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO29CQUNqQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQztvQkFDOUIsT0FBTyxFQUFFLENBQUM7aUJBQ1g7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDTCxHQUFrQixFQUFFO1lBQ2xCLElBQUksUUFBUSxFQUFFO2dCQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQztZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVEOztNQUVFO0lBQ0ssV0FBVztRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUN0QixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzNDLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDWixPQUFPLEVBQUUsQ0FBQzthQUNYO2lCQUFNO2dCQUNMLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO2dCQUM5QixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ2YsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQ3hCLHdCQUF3QjtvQkFDeEIsSUFBSSxHQUFHLEVBQUU7d0JBQ1AsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNiO3lCQUFNO3dCQUNMLE9BQU8sRUFBRSxDQUFDO3FCQUNYO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7TUFFRTtJQUNLLEtBQUssQ0FBQyxhQUFhLENBQ3hCLElBQXVCLEVBQ3ZCLEtBQWdDLEVBQ2hDLFFBQThCO1FBRTlCLDBCQUEwQjtRQUMxQixJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDWixJQUFJO2dCQUNGLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuQztZQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUU7WUFDaEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzlCLE9BQU87WUFDUCxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQiwyQkFBMkI7WUFDM0IsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osSUFBSTtvQkFDRixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3BDO2dCQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUU7YUFDakI7U0FDRjtRQUNELEtBQUssQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBQy9CLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQ3pCLENBQUM7Q0FDRiJ9