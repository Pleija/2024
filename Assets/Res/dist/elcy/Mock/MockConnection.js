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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0Nvbm5lY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTW9jay9Nb2NrQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd0QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saURBQWlELENBQUM7QUFFbEYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDOUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFLN0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFFakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDakYsT0FBTyxFQUFF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