import { DialectBase, DialectKind, IDialectBase } from './index.mjs'
import { ConditionFunction } from '../../condition.mjs'
import { TableInfo } from '../../types.mjs'

export class WhereDialect<M, R> extends DialectBase<M, R> {
    constructor(info: TableInfo<M>, sql: string, kind: DialectKind) {
        super(info)
        this.kind = kind
        this.sql = sql
    }

    where(condition?: ConditionFunction<M>): IDialectBase<R> {
        if (condition) {
            this.sql += ` WHERE ${this._condSql(condition)}`
        }
        return this
    }
}
