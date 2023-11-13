import { QueryCondition } from './QueryCondition.mjs';
import { QueryModelBase } from './QueryModelBase.mjs';
import { QueryModelPredicates } from './QueryModelPredicates.mjs';
import { isModelPredicates } from './Where.mjs';
export class QueryModel extends QueryModelBase {
    constructor(type) {
        super(type);
    }
    /**
     * count all models using an optional filter
     *
     * @param sqldb - The database connection
     * @param [filter] - An optional Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns promise of the number of models
     */
    async countAll(sqldb, filter, params) {
        try {
            params = Object.assign({}, params);
            const select = await this.getSelectStatementForColumnExpression('COUNT(*) as result', filter || {}, params);
            const row = await sqldb.get(select, params);
            return row.result || 0;
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`count '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * check if model exist using an optional filter
     *
     * @param sqldb - The database connection
     * @param [filter] - An optional Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns promise for boolean result
     */
    async exists(sqldb, filter, params) {
        try {
            params = Object.assign({}, params);
            const subQuery = await this.getSelectStatementForColumnExpression('1', filter || {}, params);
            const select = `SELECT EXISTS(\n${subQuery}) as result\n`;
            const row = await sqldb.get(select, params);
            return row.result ? true : false;
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`count '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * Select one model using an optional filter
     *
     * @param sqldb - The database connection
     * @param [filter] - An optional Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the selected model instance; rejects if result is not exactly one row
     */
    async selectOne(sqldb, filter, params) {
        try {
            params = Object.assign({}, params);
            const select = await this.getSelectStatement(this.toSelectAllColumnsFilter(filter), params);
            const rows = await sqldb.all(select, params);
            if (rows.length != 1) {
                return Promise.reject(new Error(`select '${this.table.name}' failed: unexpectedly got ${rows.length} rows`));
            }
            return this.updateModelFromRow(new this.type(), rows[0]);
        }
        catch (e) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * Select all models using an optional filter
     *
     * @param sqldb - The database connection
     * @param [filter] - An optional Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    async selectAll(sqldb, filter, params) {
        try {
            params = Object.assign({}, params);
            const select = await this.getSelectStatement(this.toSelectAllColumnsFilter(filter), params);
            const rows = await sqldb.all(select, params);
            const results = [];
            rows.forEach((row) => {
                results.push(this.updateModelFromRow(new this.type(), row));
            });
            return results;
        }
        catch (e) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * Select all partial models using a filter
     *
     * @param sqldb - The database connection
     * @param filter - A Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of partial models
     */
    async selectPartialAll(sqldb, filter, params) {
        try {
            params = Object.assign({}, params);
            const select = await this.getSelectStatement(filter, params);
            const rows = await sqldb.all(select, select);
            const results = [];
            rows.forEach((row) => {
                results.push(this.getPartialFromRow(row));
            });
            return results;
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * Select a given model by ID
     *
     * @param sqldb - The database connection
     * @param model - The input/output model
     * @returns A promise of the model instance
     */
    async selectModel(sqldb, model) {
        try {
            const row = await sqldb.get(this.getSelectByIdStatement(), this.bindPrimaryKeyInputParams(model));
            model = this.updateModelFromRow(model, row);
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
        return model;
    }
    /**
     * Select a model by given partial model
     *
     * @param sqldb - The database connection
     * @param input - The partial model providing the ID
     * @returns A promise of the model
     */
    async selectModelById(sqldb, input) {
        let model = new this.type();
        try {
            const row = await sqldb.get(this.getSelectByIdStatement(), this.bindPrimaryKeyInputParams(input));
            model = this.updateModelFromRow(model, row);
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
        return model;
    }
    /*
     * select each model using a callback
     */
    async selectEach(sqldb, callback, filter, params) {
        try {
            params = Object.assign({}, params);
            const select = await this.getSelectStatement(this.toSelectAllColumnsFilter(filter), params);
            const res = await sqldb.each(select, params, (err, row) => {
                // TODO: err?
                callback(err, this.updateModelFromRow(new this.type(), row));
            });
            return res;
        }
        catch (e) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
    }
    async getWhereClause(filter, params) {
        if (!filter || !filter.where) {
            return '';
        }
        let where = filter.where;
        if (typeof where === 'string') {
            where = where.trimStart();
            if (!where.length) {
                return '';
            }
            if (where.substring(0, 5).toUpperCase() !== 'WHERE') {
                return `WHERE ${where}`;
            }
            return where;
        }
        const tableAlias = filter.tableAlias ? filter.tableAlias : undefined;
        const tablePrefix = tableAlias && tableAlias.length ? `${tableAlias}.` : '';
        let oper;
        if (isModelPredicates(where)) {
            oper = new QueryModelPredicates(where);
        }
        else {
            oper = new QueryCondition(where);
        }
        const whereClause = await oper.toSql(this.metaModel, params, tablePrefix);
        return whereClause.length ? `WHERE ${whereClause}` : whereClause;
    }
    async getSelectStatement(filter, params) {
        try {
            let sql = this.getSelectAllStatement(this.getSelectColumns(filter), filter.tableAlias);
            sql += await this.getNonColumnClauses(filter, params);
            return sql;
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getSelectStatementForColumnExpression(colexpr, filter, params) {
        try {
            let sql = this.getSelectAllStatementForColumnExpression(colexpr, filter.tableAlias);
            sql += await this.getNonColumnClauses(filter, params);
            return sql;
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(e);
        }
    }
    getSelectColumns(filter) {
        if (!filter.select) {
            return undefined;
        }
        const columns = [];
        for (const key in filter.select) {
            if (Object.prototype.hasOwnProperty.call(filter.select, key) && filter.select[key]) {
                const prop = this.metaModel.properties.get(key);
                if (!prop) {
                    continue;
                }
                columns.push(key);
            }
        }
        return columns.length ? columns : undefined;
    }
    async getNonColumnClauses(filter, params) {
        let sql = '';
        const whereClause = await this.getWhereClause(filter, params);
        if (whereClause.length) {
            sql += `  ${whereClause}\n`;
        }
        const orderByClause = this.getOrderByClause(filter);
        if (orderByClause.length) {
            sql += `  ${orderByClause}\n`;
        }
        const limitClause = this.getLimitClause(filter);
        if (limitClause.length) {
            sql += `  ${limitClause}\n`;
        }
        const offsetClause = this.getOffsetClause(filter);
        if (offsetClause.length) {
            sql += `  ${offsetClause}\n`;
        }
        return sql;
    }
    getOrderByClause(filter) {
        if (!filter || !filter.order) {
            return '';
        }
        const columns = [];
        for (const key in filter.order) {
            /* istanbul ignore if */
            if (!Object.prototype.hasOwnProperty.call(filter.order, key)) {
                continue;
            }
            const prop = this.metaModel.properties.get(key);
            if (!prop) {
                continue;
            }
            if (filter.order[key]) {
                columns.push(prop.field.quotedName);
            }
            else {
                columns.push(`${prop.field.quotedName} DESC`);
            }
        }
        if (!columns.length) {
            return '';
        }
        const tableAlias = filter.tableAlias ? filter.tableAlias : undefined;
        const tablePrefix = tableAlias && tableAlias.length ? `${tableAlias}.` : '';
        return `ORDER BY ${tablePrefix}` + columns.join(`, ${tablePrefix}`);
    }
    getLimitClause(filter) {
        if (!filter || !filter.limit) {
            return '';
        }
        return `LIMIT ${filter.limit}`;
    }
    getOffsetClause(filter) {
        if (!filter || !filter.offset) {
            return '';
        }
        return ` OFFSET ${filter.offset}`;
    }
    toSelectAllColumnsFilter(filter) {
        const res = Object.assign({}, filter);
        if (res.select) {
            delete res.select;
        }
        return res;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3F1ZXJ5L1F1ZXJ5TW9kZWwubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGlCQUFpQixFQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXZELE1BQU0sT0FBTyxVQUFjLFNBQVEsY0FBaUI7SUFDbEQsWUFBWSxJQUFtQjtRQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBa0IsRUFBRSxNQUFrQixFQUFFLE1BQWU7UUFDcEUsSUFBSTtZQUNGLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxxQ0FBcUMsQ0FDN0Qsb0JBQW9CLEVBQ3BCLE1BQU0sSUFBSSxFQUFFLEVBQ1osTUFBTSxDQUNQLENBQUM7WUFDRixNQUFNLEdBQUcsR0FBUSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLENBQUMsQ0FBQywwQkFBMEIsRUFBRTtZQUNyQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksYUFBYSxDQUFD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