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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3F1ZXJ5L1F1ZXJ5TW9kZWwubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGlCQUFpQixFQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXZELE1BQU0sT0FBTyxVQUFjLFNBQVEsY0FBaUI7SUFDbEQsWUFBWSxJQUFtQjtRQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBa0IsRUFBRSxNQUFrQixFQUFFLE1BQWU7UUFDcEUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFDQUFxQyxDQUM3RCxvQkFBb0IsRUFDcEIsTUFBTSxJQUFJLEVBQUUsRUFDWixNQUFNLENBQ1AsQ0FBQztZQUNGLE1BQU0sR0FBRyxHQUFRLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUN0QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFD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