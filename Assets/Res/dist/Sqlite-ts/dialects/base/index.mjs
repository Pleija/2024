import { Condition } from '../../condition.mjs';
import { Utils } from '../../utils.mjs';
export var DialectKind;
(function (DialectKind) {
    DialectKind[DialectKind["READ"] = 0] = "READ";
    DialectKind[DialectKind["SINGLE"] = 1] = "SINGLE";
    DialectKind[DialectKind["COUNT"] = 2] = "COUNT";
    DialectKind[DialectKind["ANY"] = 3] = "ANY";
    DialectKind[DialectKind["WRITE"] = 4] = "WRITE";
    DialectKind[DialectKind["JOIN"] = 5] = "JOIN";
})(DialectKind || (DialectKind = {}));
export class DialectBase {
    sql;
    finally(onfinally) {
        return this.promise.finally(onfinally);
    }
    [Symbol.toStringTag];
    info;
    kind = DialectKind.READ;
    aliases;
    map;
    res;
    rej;
    promise;
    constructor(info) {
        this.promise = new Promise((resolve, reject) => {
            this.res = resolve;
            this.rej = reject;
        });
        this.sql = '';
        this.info = info;
    }
    then(resolve, reject) {
        switch (this.kind) {
            case DialectKind.READ:
                return this._query(this.sql).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
            case DialectKind.JOIN:
                if (!this.aliases || !this.map) {
                    throw new Error('Join statement needs column alias and map object');
                }
                return this._query(this.sql, this.aliases, this.map).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
            case DialectKind.SINGLE:
                if (!this.sql.endsWith('LIMIT 1')) {
                    this.sql += ' LIMIT 1';
                }
                return this._single(this.sql).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
            case DialectKind.COUNT:
                return this._count(this.sql).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
            case DialectKind.ANY:
                return this._any(this.sql).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
            case DialectKind.WRITE:
                return this._exec(this.sql).then(results => {
                    if (resolve) {
                        resolve(results);
                    }
                }, reject);
        }
        throw new Error('Dialect not resolved');
    }
    catch(onRejected) {
        return this.promise.catch(onRejected);
    }
    resolve(value) {
        if (this.res) {
            return this.res(value);
        }
    }
    reject(reason) {
        if (this.rej) {
            return this.rej(reason);
        }
    }
    /**
     * Build SELECT sql from function.
     * @param fn Fields selection function. eg: p => p.foo or p => [ p.foo, p.bar ].
     */
    _select(fn) {
        const result = fn.call(this, this.info.descriptor);
        const fields = result instanceof Array ? result : result.split(',');
        return this._buildSelectFields(fields);
    }
    /**
     * Build selected fields for SELECT statement.
     * @param fields selected fields.
     */
    _buildSelectFields(fields) {
        const selected = [];
        fields.forEach(k => {
            selected.push(Utils.selectAs(this.info.columns[k], k));
        });
        return selected.join(',');
    }
    /**
     * Build SQL statement from condition function.
     * @param fn Condition function.
     */
    _condSql(fn) {
        return fn(new Condition(this.info.descriptor, this.info.columns)).sql();
    }
    /**
     * Map raw entity result to actual entity type.
     * @param raw Raw entity result (from query result).
     */
    _mapResult(raw) {
        if (!raw) {
            return undefined;
        }
        const { columns } = this.info;
        const obj = {};
        Object.keys(raw).forEach(k => {
            if (columns[k]) {
                obj[k] = Utils.asResult(columns[k].type, raw[k]);
            }
            else {
                obj[k] = raw[k];
            }
        });
        return obj;
    }
    _mapResultWithAlias(raw, aliases) {
        if (!raw) {
            return undefined;
        }
        const obj = {};
        Object.keys(raw).forEach(k => {
            const key = k.split('___');
            const { columns } = aliases[key[0]];
            if (columns[key[1]]) {
                obj[k] = Utils.asResult(columns[key[1]].type, raw[k]);
            }
            else {
                obj[k] = raw[k];
            }
        });
        return obj;
    }
    /**
     * Execute SQL statement.
     * @param sql SQL statement.
     */
    _exec(sql) {
        return this.info.db.exec(sql);
    }
    /**
     * Execute SQL statement as single query that returns single entity object.
     * @param sql SQL statement.
     */
    async _single(sql) {
        return this._mapResult(await this.info.db.single(sql));
    }
    /**
     * Execute SQL statement as normal query that returns list of entity object.
     * @param sql SQL statement.
     */
    async _query(sql, aliases, map) {
        const data = await this.info.db.query(sql);
        if (aliases) {
            if (!map) {
                throw new Error('Alias needs map');
            }
            // build results as match with map object
            const translate = (o, dict) => {
                const res = { ...o };
                for (const k of Object.keys(o)) {
                    const val = o[k];
                    if (typeof val === 'string') {
                        // val is alias?
                        res[k] = dict[val];
                    }
                    else {
                        // val is nested object
                        res[k] = translate(val, dict);
                    }
                }
                return res;
            };
            return data.map(d => translate(map, this._mapResultWithAlias(d, aliases)));
        }
        // return flat entity
        return data.map(d => this._mapResult(d));
    }
    /**
     * Execute SQL statement as count query that returns the number data.
     * @param sql SQL statement.
     */
    async _count(sql) {
        return (await this._single(sql)).count;
    }
    /**
     * Execute SQL statement as count query and returns true if data number is found otherwise false.
     * @param sql SQL statement.
     */
    async _any(sql) {
        return (await this._count(sql)) > 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TcWxpdGUtdHMvZGlhbGVjdHMvYmFzZS9pbmRleC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFFdkMsTUFBTSxDQUFOLElBQVksV0FPWDtBQVBELFdBQVksV0FBVztJQUNuQiw2Q0FBUSxDQUFBO0lBQ1IsaURBQVUsQ0FBQTtJQUNWLCtDQUFTLENBQUE7SUFDVCwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7QUFDWixDQUFDLEVBUFcsV0FBVyxLQUFYLFdBQVcsUUFPdEI7QUFNRCxNQUFNLE9BQU8sV0FBVztJQUdiLEdBQUcsQ0FBUztJQUVuQixPQUFPLENBQUMsU0FBMkM7UUFDL0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQVc7SUFFckIsSUFBSSxDQUFjO0lBQ2xCLElBQUksR0FBZ0IsV0FBVyxDQUFDLElBQUksQ0FBQTtJQUNwQyxPQUFPLENBQXlCO0lBQ2hDLEdBQUcsQ0FBTTtJQUVYLEdBQUcsQ0FBb0Q7SUFDdkQsR0FBRyxDQUFzQztJQUNoQyxPQUFPLENBQVk7SUFFcEMsWUFBWSxJQUFrQjtRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzNDLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO1FBRUYsSUFB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