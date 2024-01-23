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
    finally(onfinally) {
        return this.promise.finally(onfinally);
    }
    constructor(info) {
        this.kind = DialectKind.READ;
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
Symbol.toStringTag;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TcWxpdGUtdHMvZGlhbGVjdHMvYmFzZS9pbmRleC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQTtBQUVsRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFFdkMsTUFBTSxDQUFOLElBQVksV0FPWDtBQVBELFdBQVksV0FBVztJQUNuQiw2Q0FBUSxDQUFBO0lBQ1IsaURBQVUsQ0FBQTtJQUNWLCtDQUFTLENBQUE7SUFDVCwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7QUFDWixDQUFDLEVBUFcsV0FBVyxLQUFYLFdBQVcsUUFPdEI7QUFNRCxNQUFNLE9BQU8sV0FBVztJQUtwQixPQUFPLENBQUMsU0FBMkM7UUFDL0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBYUQsWUFBWSxJQUFrQjtRQVJwQixTQUFJLEdBQWdCLFdBQVcsQ0FBQyxJQUFJLENBQUE7UUFTMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQTtZQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7SUFDcEIsQ0FBQztJQUVNLElBQUksQ0FDUCxPQUdlLEVBQ2YsTUFHZTtRQUVmLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUss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