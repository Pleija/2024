import { ColumnGeneration, QueryType } from "../Common/Enum";
import { TimeSpan } from "../Common/TimeSpan";
import { Uuid } from "../Common/Uuid";
import { EventHandlerFactory } from "../Event/EventHandlerFactory";
import { EqualExpression } from "../ExpressionBuilder/Expression/EqualExpression";
import { StrictEqualExpression } from "../ExpressionBuilder/Expression/StrictEqualExpression";
import { ValueExpression } from "../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionExecutor } from "../ExpressionBuilder/ExpressionExecutor";
import { isNull, visitExpression } from "../Helper/Util";
import { IntegerColumnMetaData } from "../MetaData/IntegerColumnMetaData";
import { StringColumnMetaData } from "../MetaData/StringColumnMetaData";
import { BulkDeferredQuery } from "../Query/DeferredQuery/BulkDeferredQuery";
import { PagingJoinRelation } from "../Queryable/Interface/PagingJoinRelation";
import { ColumnExpression } from "../Queryable/QueryExpression/ColumnExpression";
import { DeleteExpression } from "../Queryable/QueryExpression/DeleteExpression";
import { InsertExpression } from "../Queryable/QueryExpression/InsertExpression";
import { InsertIntoExpression } from "../Queryable/QueryExpression/InsertIntoExpression";
import { SelectExpression } from "../Queryable/QueryExpression/SelectExpression";
import { SqlParameterExpression } from "../Queryable/QueryExpression/SqlParameterExpression";
import { UpdateExpression } from "../Queryable/QueryExpression/UpdateExpression";
import { UpsertExpression } from "../Queryable/QueryExpression/UpsertExpression";
const charList = ["a", "a", "i", "i", "u", "u", "e", "e", "o", "o", " ", " ", " ", "h", "w", "l", "r", "y"];
export class MockConnection {
    get inTransaction() {
        return this._transactions.any();
    }
    get results() {
        if (!this._results) {
            if (!this._generatedResults) {
                this._generatedResults = this.generateQueryResult();
            }
            return this._generatedResults;
        }
        return this._results;
    }
    set results(value) {
        this._results = value;
    }
    //#region Abstract Member
    get isolationLevel() {
        return this._isolationLevel;
    }
    constructor(database) {
        this._isolationLevel = "READ COMMITTED";
        this._transactions = [];
        this.database = database || "database";
        [this.errorEvent, this.onError] = EventHandlerFactory(this);
    }
    close() {
        return Promise.resolve();
    }
    commitTransaction() {
        this._isolationLevel = this._transactions.pop();
        return Promise.resolve();
    }
    generateQueryResult() {
        return this._deferredQueries
            .selectMany((def) => {
            if (def instanceof BulkDeferredQuery) {
                return def.defers.cast()
                    .selectMany((def1) => def1.queryExps.select((o) => [def1, o]));
            }
            else {
                return def.queryExps.select((o) => [def, o]);
            }
        })
            .selectMany((o) => {
            const deferred = o[0];
            const command = o[1];
            const skipCount = deferred.tvpMap.size;
            const tvps = deferred.tvpMap.asEnumerable().toArray();
            if (command instanceof InsertIntoExpression) {
                let i = 0;
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    i++;
                    if (query.type & QueryType.DML) {
                        if (i >= skipCount) {
                            result.effectedRows = Math.floor(Math.random() * 100 + 1);
                        }
                        else {
                            const queryValue = tvps[i][1];
                            if (Array.isArray(queryValue)) {
                                result.effectedRows = queryValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof SelectExpression) {
                const queries = deferred.queries.skip(skipCount * 2).toArray();
                const selects = this.flattenSelectExpression(command);
                const map = new Map();
                let qi = 0;
                for (const select of selects) {
                    const query = queries[qi++];
                    const rows = [];
                    map.set(select, rows);
                    const propValueMap = {};
                    if (select.where) {
                        visitExpression(select.where, (exp) => {
                            if (exp instanceof EqualExpression || exp instanceof StrictEqualExpression) {
                                if (exp.leftOperand instanceof ColumnExpression && exp.leftOperand.entity.type === select.entity.type) {
                                    let value = null;
                                    if (exp.rightOperand instanceof ValueExpression) {
                                        value = exp.rightOperand.value;
                                    }
                                    else if (exp.rightOperand instanceof SqlParameterExpression) {
                                        value = query.parameters[exp.rightOperand.name];
                                    }
                                    if (value) {
                                        propValueMap[exp.leftOperand.propertyName] = value;
                                    }
                                }
                                else if (exp.rightOperand instanceof ColumnExpression && exp.rightOperand.entity.type === select.entity.type) {
                                    let value = null;
                                    if (exp.leftOperand instanceof ValueExpression) {
                                        value = exp.leftOperand.value;
                                    }
                                    else if (exp.leftOperand instanceof SqlParameterExpression) {
                                        value = query.parameters[exp.leftOperand.name];
                                    }
                                    if (value) {
                                        propValueMap[exp.rightOperand.propertyName] = value;
                                    }
                                }
                            }
                        });
                    }
                    if (select.parentRelation) {
                        const parentInclude = select.parentRelation;
                        const relMap = Array.from(parentInclude.relationMap());
                        let parentExp = parentInclude.parent;
                        while (parentExp.parentRelation && parentExp.parentRelation.isEmbedded) {
                            parentExp = parentExp.parentRelation.parent;
                        }
                        const parentRows = map.get(parentExp);
                        const maxRowCount = this.getMaxCount(select, query, 3);
                        for (const parent of parentRows) {
                            const numberOfRecord = parentInclude.type === "one" ? 1 : Math.floor(Math.random() * maxRowCount) + 1;
                            for (let i = 0; i < numberOfRecord; i++) {
                                const item = {};
                                for (const col of select.projectedColumns) {
                                    item[col.dataPropertyName] = this.generateValue(col);
                                }
                                for (const prop in propValueMap) {
                                    item[prop] = propValueMap[prop];
                                }
                                rows.push(item);
                                for (const [parentCol, entityCol] of relMap) {
                                    item[entityCol.propertyName] = parent[parentCol.propertyName];
                                }
                            }
                        }
                    }
                    else {
                        const maxRowCount = this.getMaxCount(select, query, 10);
                        const numberOfRecord = Math.floor(Math.random() * maxRowCount) + 1;
                        for (let i = 0; i < numberOfRecord; i++) {
                            const item = {};
                            for (const col of select.projectedColumns) {
                                item[col.dataPropertyName] = this.generateValue(col);
                            }
                            for (const prop in propValueMap) {
                                item[prop] = propValueMap[prop];
                            }
                            rows.push(item);
                        }
                    }
                }
                const generatedResults = Array.from(map.values());
                let index = 0;
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    if (query.type & QueryType.DML) {
                        if (tvps[index]) {
                            const paramValue = tvps[index][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    else if (query.type & QueryType.DQL) {
                        const rows = generatedResults[index++];
                        result.rows = rows;
                    }
                    return result;
                });
            }
            else if (command instanceof InsertExpression) {
                let i = 0;
                const generatedColumns = command.entity.columns.where((col) => !isNull(col.columnMeta))
                    .where((col) => (col.columnMeta.generation & ColumnGeneration.Insert) !== 0 || !!col.columnMeta.defaultExp).toArray();
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    i++;
                    if (query.type & QueryType.DQL) {
                        const rows = command.values.select((v) => {
                            const val = {};
                            for (const col of generatedColumns) {
                                const paramExp = v[col.dataPropertyName];
                                val[col.dataPropertyName] = paramExp ? query.parameters[paramExp.name]
                                    : this.generateValue(col);
                            }
                            return val;
                        }).toArray();
                        result.rows = rows;
                    }
                    if (query.type & QueryType.DML) {
                        if (i >= skipCount) {
                            result.effectedRows = command.values.length;
                        }
                        else {
                            const paramValue = tvps[i][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof UpdateExpression) {
                let i = 0;
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    if (query.type & QueryType.DML) {
                        i++;
                        if (i < skipCount) {
                            const paramValue = tvps[i][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof DeleteExpression) {
                let i = 0;
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    if (query.type & QueryType.DML) {
                        i++;
                        if (i < skipCount) {
                            const paramValue = tvps[i][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof UpsertExpression) {
                const dmlCount = deferred.queries.where((query) => (query.type & QueryType.DML) !== 0).count();
                let i = 0;
                return deferred.queries.select((query) => {
                    const result = {
                        effectedRows: 1
                    };
                    if (query.type & QueryType.DML) {
                        i++;
                        if (i !== dmlCount) {
                            const paramValue = tvps[i][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            return [];
        }).toArray();
    }
    generateValue(column) {
        if (column.columnMeta) {
            const columnMeta = column.columnMeta;
            if (columnMeta.defaultExp) {
                return ExpressionExecutor.execute(columnMeta.defaultExp.body);
            }
        }
        switch (column.type) {
            case Uuid:
                return Uuid.new().toString();
            case Number:
                let fix = 2;
                if (column.columnMeta && column.columnMeta instanceof IntegerColumnMetaData) {
                    fix = 0;
                }
                return Number((Math.random() * 10000 + 1).toFixed(fix));
            case String: {
                let result = "";
                let number = Math.random() * 100 + 1;
                if (column.columnMeta && column.columnMeta instanceof StringColumnMetaData && column.columnMeta.length > 0) {
                    number = column.columnMeta.length;
                }
                for (let i = 0; i < number; i++) {
                    let char = String.fromCharCode(Math.round(Math.random() * 90) + 32);
                    if (/[^a-z ]/i.test(char)) {
                        char = charList[Math.floor(Math.random() * charList.length)];
                    }
                    result += char;
                }
                return result;
            }
            case Date: {
                const number = Math.round(Math.random() * 31536000000) + 1514653200000;
                return new Date(number);
            }
            case TimeSpan: {
                const number = Math.round(Math.random() * 86400000);
                return new TimeSpan(number);
            }
            case Boolean: {
                return Boolean(Math.round(Math.random()));
            }
            case ArrayBuffer:
            case Uint8Array:
            case Uint16Array:
            case Uint32Array:
            case Int8Array:
            case Int16Array:
            case Int32Array:
            case Uint8ClampedArray:
            case Float32Array:
            case Float64Array:
            case DataView: {
                const size = Math.floor((Math.random() * 16) + 1);
                const values = Array(size);
                for (let i = 0; i < size; i++) {
                    values[0] = Math.floor(Math.random() * 256);
                }
                const result = new Uint8Array(values);
                return result;
            }
        }
        return null;
    }
    open() {
        return Promise.resolve();
    }
    async query(...commands) {
        const count = commands.length || 1;
        return this.results.splice(0, count);
    }
    reset() {
        return Promise.resolve();
    }
    rollbackTransaction() {
        this._isolationLevel = this._transactions.pop();
        return Promise.resolve();
    }
    setIsolationLevel(isolationLevel) {
        this._isolationLevel = isolationLevel;
        return Promise.resolve();
    }
    setQueries(deferredQueries) {
        this._deferredQueries = deferredQueries;
        this._generatedResults = null;
    }
    startTransaction(isolationLevel) {
        this._transactions.push(this._isolationLevel);
        this.setIsolationLevel(isolationLevel);
        return Promise.resolve();
    }
    extractValue(query, exp) {
        if (exp instanceof ValueExpression) {
            return ExpressionExecutor.execute(exp);
        }
        else if (query.parameters && exp instanceof SqlParameterExpression) {
            const value = query.parameters[exp.name];
            if (value !== undefined) {
                return value;
            }
        }
        return null;
    }
    flattenSelectExpression(selectExp) {
        const results = [selectExp];
        for (let i = 0; i < results.length; i++) {
            const select = results[i];
            const addition = select.resolvedIncludes.select((o) => o.child).toArray();
            results.splice(i + 1, 0, ...addition);
        }
        return results;
    }
    getMaxCount(select, query, defaultValue = 10) {
        if (select.paging && select.paging.take) {
            defaultValue = this.extractValue(query, select.paging.take);
        }
        else {
            const takeJoin = select.joins.first((o) => o instanceof PagingJoinRelation);
            if (takeJoin) {
                if (takeJoin.end) {
                    defaultValue = this.extractValue(query, takeJoin.end);
                    if (takeJoin.start) {
                        defaultValue -= this.extractValue(query, takeJoin.start);
                    }
                }
            }
        }
        return defaultValue;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0Nvbm5lY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Nb2NrL01vY2tDb25uZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3RDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUVsRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUM5RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saURBQWlELENBQUM7QUFDbEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMxRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUs3RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUVqRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNqRixPQUFPLEVBQUUs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