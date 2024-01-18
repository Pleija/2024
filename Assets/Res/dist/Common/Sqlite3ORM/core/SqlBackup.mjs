/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// online backup
// https://github.com/mapbox/node-sqlite3/pull/1116
// TODO(Backup API): typings not yet available
import * as _dbg from 'debug';
const debug = _dbg('sqlite3orm:backup');
export class SqlBackup {
    get idle() {
        return this.backup.idle;
    }
    get completed() {
        return this.backup.completed;
    }
    get failed() {
        return this.backup.failed;
    }
    /**
     * Returns an integer with the remaining number of pages left to copy
     * Returns -1 if `step` not yet called
     *
     */
    get remaining() {
        return this.backup.remaining;
    }
    /**
     * Returns an integer with the total number of pages
     * Returns -1 if `step` not yet called
     *
     */
    get pageCount() {
        return this.backup.pageCount;
    }
    /**
     * Returns the progress (percentage completion)
     *
     */
    get progress() {
        const pageCount = this.pageCount;
        const remaining = this.remaining;
        if (pageCount === -1 || remaining === -1) {
            return 0;
        }
        return pageCount === 0 ? 100 : ((pageCount - remaining) / pageCount) * 100;
    }
    /**
     * Creates an instance of SqlBackup.
     *
     * @param backup
     */
    constructor(backup) {
        this.backup = backup;
        debug(`backup initialized: page count: ${this.pageCount}`);
    }
    step(pages = -1) {
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
            if (!this.backup) {
                const err = new Error('backup handle not open');
                debug(`step '${pages}' failed: ${err.message}`);
                reject(err);
                return;
            }
            this.backup.step(pages, (err) => {
                /* istanbul ignore if */
                if (err) {
                    debug(`step '${pages}' failed: ${err.message}`);
                    reject(err);
                }
                debug(`step '${pages}' succeeded`);
                resolve();
            });
        });
    }
    finish() {
        debug(`finished`);
        this.backup.finish();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsQmFja3VwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vY29yZS9TcWxCYWNrdXAubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFFdkQsZ0JBQWdCO0FBQ2hCLG1EQUFtRDtBQUNuRCw4Q0FBOEM7QUFDOUMsT0FBTyxLQUFLLElBQUksTUFBTSxPQUFPLENBQUM7QUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFeEMsTUFBTSxPQUFPLFNBQVM7SUFHcEIsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksU0FBUztRQUNYLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLFFBQVE7UUFDVixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDekMsT0FBTyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0QsT0FBTyxTQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQzdFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxNQUFXO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxtQ0FBbUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELElBQUksQ0FBQyxRQUFnQixDQUFDLENBQUM7UUFDckIsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzQyx3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDaEQsS0FBSyxDQUFDLFNBQVMsS0FBSyxhQUFhLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1osT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDbkMsd0JBQXdCO2dCQUN4QixJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNSLEtBQUssQ0FBQyxTQUFTLEtBQUssYUFBYSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsS0FBSyxDQUFDLFNBQVMsS0FBSyxhQUFhLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU07UUFDSixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2QixDQUFDO0NBQ0YifQ==