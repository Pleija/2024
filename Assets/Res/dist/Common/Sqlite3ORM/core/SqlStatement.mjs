/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as core from './core';
import { iterator } from "Common/Iterator.mjs";
/**
 * A thin wrapper for the 'Statement' class from 'node-sqlite3' using Promises instead of callbacks
 * see
 * https://github.com/mapbox/node-sqlite3/wiki/API
 *
 * @export
 * @class SqlStatement
 */
export class SqlStatement {
    stmt;
    /**
     * Creates an instance of SqlStatement.
     *
     * @param stmt
     */
    constructor(stmt) {
        this.stmt = stmt;
    }
    /**
     * Bind the given parameters to the prepared statement
     *
     * @param params
     */
    /* istanbul ignore next */
    // see https://github.com/mapbox/node-sqlite3/issues/841
    bind(...params) {
        this.stmt.bind(params);
        return this;
    }
    /**
     * Reset a open cursor of the prepared statement preserving the parameter binding
     * Allows re-execute of the same query
     *
     * @returns {Promise<void>}
     */
    reset() {
        return new Promise((resolve) => {
            this.stmt.reset(() => {
                resolve();
            });
        });
    }
    /**
     * Finalizes a prepared statement ( freeing any resource used by this statement )
     *
     * @returns {Promise<void>}
     */
    finalize() {
        return new Promise((resolve, reject) => {
            this.stmt.finalize((err) => {
                if (err) {
                    /* istanbul ignore next */
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Runs a prepared statement with the specified parameters
     *
     * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
     * @returns A promise
     */
    run(params) {
        return new Promise((resolve, reject) => {
            this.stmt.run(params, function (err) {
                if (err) {
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
     * Runs a prepared statement with the specified parameters, fetching only the first row
     *
     * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
     * @returns A promise
     */
    get(params) {
        return new Promise((resolve, reject) => {
            this.stmt.get(params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    /**
     * Runs a prepared statement with the specified parameters, fetching all rows
     *
     * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
     * @returns A promise
     */
    all(params) {
        return new Promise((resolve, reject) => {
            this.stmt.all(params, (err, rows) => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                }
                else {
                    let values = [];
                    iterator(rows).forEach((v, k) => {
                        values.push(v);
                    });
                    resolve(values);
                }
            });
        });
    }
    /**
     * Runs a prepared statement with the specified parameters, fetching all rows
     * using a callback for each row
     *
     * @param [params]
     * @param [callback]
     * @returns A promise
     */
    each(params, callback) {
        return new Promise((resolve, reject) => {
            this.stmt.each(params, callback, (err, count) => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                }
                else {
                    resolve(count);
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsU3RhdGVtZW50Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vY29yZS9TcWxTdGF0ZW1lbnQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFDdkQsa0NBQWtDO0FBS2xDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQU8vQzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxPQUFPLFlBQVk7SUFDSixJQUFJLENBQVk7SUFFakM7Ozs7T0FJRztJQUNILFlBQW1CLElBQWU7UUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCwwQkFBMEI7SUFFMUIsd0RBQXdEO0lBQ2pELElBQUksQ0FBQyxHQUFHLE1BQWE7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSztRQUNSLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksUUFBUTtRQUNYLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsMEJBQTBCO29CQUMxQixNQUFNLENBQUMs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