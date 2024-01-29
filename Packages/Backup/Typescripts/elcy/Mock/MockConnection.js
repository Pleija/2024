"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConnection = void 0;
var Enum_1 = require("../Common/Enum");
var TimeSpan_1 = require("../Common/TimeSpan");
var Uuid_1 = require("../Common/Uuid");
var EventHandlerFactory_1 = require("../Event/EventHandlerFactory");
var EqualExpression_1 = require("../ExpressionBuilder/Expression/EqualExpression");
var StrictEqualExpression_1 = require("../ExpressionBuilder/Expression/StrictEqualExpression");
var ValueExpression_1 = require("../ExpressionBuilder/Expression/ValueExpression");
var ExpressionExecutor_1 = require("../ExpressionBuilder/ExpressionExecutor");
var Util_1 = require("../Helper/Util");
var IntegerColumnMetaData_1 = require("../MetaData/IntegerColumnMetaData");
var StringColumnMetaData_1 = require("../MetaData/StringColumnMetaData");
var BulkDeferredQuery_1 = require("../Query/DeferredQuery/BulkDeferredQuery");
var PagingJoinRelation_1 = require("../Queryable/Interface/PagingJoinRelation");
var ColumnExpression_1 = require("../Queryable/QueryExpression/ColumnExpression");
var DeleteExpression_1 = require("../Queryable/QueryExpression/DeleteExpression");
var InsertExpression_1 = require("../Queryable/QueryExpression/InsertExpression");
var InsertIntoExpression_1 = require("../Queryable/QueryExpression/InsertIntoExpression");
var SelectExpression_1 = require("../Queryable/QueryExpression/SelectExpression");
var SqlParameterExpression_1 = require("../Queryable/QueryExpression/SqlParameterExpression");
var UpdateExpression_1 = require("../Queryable/QueryExpression/UpdateExpression");
var UpsertExpression_1 = require("../Queryable/QueryExpression/UpsertExpression");
var charList = ["a", "a", "i", "i", "u", "u", "e", "e", "o", "o", " ", " ", " ", "h", "w", "l", "r", "y"];
var MockConnection = /** @class */ (function () {
    function MockConnection(database) {
        var _a;
        this._isolationLevel = "READ COMMITTED";
        this._transactions = [];
        this.database = database || "database";
        _a = (0, EventHandlerFactory_1.EventHandlerFactory)(this), this.errorEvent = _a[0], this.onError = _a[1];
    }
    Object.defineProperty(MockConnection.prototype, "inTransaction", {
        get: function () {
            return this._transactions.any();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MockConnection.prototype, "results", {
        get: function () {
            if (!this._results) {
                if (!this._generatedResults) {
                    this._generatedResults = this.generateQueryResult();
                }
                return this._generatedResults;
            }
            return this._results;
        },
        set: function (value) {
            this._results = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MockConnection.prototype, "isolationLevel", {
        //#region Abstract Member
        get: function () {
            return this._isolationLevel;
        },
        enumerable: false,
        configurable: true
    });
    MockConnection.prototype.close = function () {
        return Promise.resolve();
    };
    MockConnection.prototype.commitTransaction = function () {
        this._isolationLevel = this._transactions.pop();
        return Promise.resolve();
    };
    MockConnection.prototype.generateQueryResult = function () {
        var _this = this;
        return this._deferredQueries
            .selectMany(function (def) {
            if (def instanceof BulkDeferredQuery_1.BulkDeferredQuery) {
                return def.defers.cast()
                    .selectMany(function (def1) { return def1.queryExps.select(function (o) { return [def1, o]; }); });
            }
            else {
                return def.queryExps.select(function (o) { return [def, o]; });
            }
        })
            .selectMany(function (o) {
            var deferred = o[0];
            var command = o[1];
            var skipCount = deferred.tvpMap.size;
            var tvps = deferred.tvpMap.asEnumerable().toArray();
            if (command instanceof InsertIntoExpression_1.InsertIntoExpression) {
                var i_1 = 0;
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    i_1++;
                    if (query.type & Enum_1.QueryType.DML) {
                        if (i_1 >= skipCount) {
                            result.effectedRows = Math.floor(Math.random() * 100 + 1);
                        }
                        else {
                            var queryValue = tvps[i_1][1];
                            if (Array.isArray(queryValue)) {
                                result.effectedRows = queryValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof SelectExpression_1.SelectExpression) {
                var queries = deferred.queries.skip(skipCount * 2).toArray();
                var selects = _this.flattenSelectExpression(command);
                var map = new Map();
                var qi = 0;
                var _loop_1 = function (select) {
                    var query = queries[qi++];
                    var rows = [];
                    map.set(select, rows);
                    var propValueMap = {};
                    if (select.where) {
                        (0, Util_1.visitExpression)(select.where, function (exp) {
                            if (exp instanceof EqualExpression_1.EqualExpression || exp instanceof StrictEqualExpression_1.StrictEqualExpression) {
                                if (exp.leftOperand instanceof ColumnExpression_1.ColumnExpression && exp.leftOperand.entity.type === select.entity.type) {
                                    var value = null;
                                    if (exp.rightOperand instanceof ValueExpression_1.ValueExpression) {
                                        value = exp.rightOperand.value;
                                    }
                                    else if (exp.rightOperand instanceof SqlParameterExpression_1.SqlParameterExpression) {
                                        value = query.parameters[exp.rightOperand.name];
                                    }
                                    if (value) {
                                        propValueMap[exp.leftOperand.propertyName] = value;
                                    }
                                }
                                else if (exp.rightOperand instanceof ColumnExpression_1.ColumnExpression && exp.rightOperand.entity.type === select.entity.type) {
                                    var value = null;
                                    if (exp.leftOperand instanceof ValueExpression_1.ValueExpression) {
                                        value = exp.leftOperand.value;
                                    }
                                    else if (exp.leftOperand instanceof SqlParameterExpression_1.SqlParameterExpression) {
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
                        var parentInclude = select.parentRelation;
                        var relMap = Array.from(parentInclude.relationMap());
                        var parentExp = parentInclude.parent;
                        while (parentExp.parentRelation && parentExp.parentRelation.isEmbedded) {
                            parentExp = parentExp.parentRelation.parent;
                        }
                        var parentRows = map.get(parentExp);
                        var maxRowCount = _this.getMaxCount(select, query, 3);
                        for (var _a = 0, parentRows_1 = parentRows; _a < parentRows_1.length; _a++) {
                            var parent_1 = parentRows_1[_a];
                            var numberOfRecord = parentInclude.type === "one" ? 1 : Math.floor(Math.random() * maxRowCount) + 1;
                            for (var i = 0; i < numberOfRecord; i++) {
                                var item = {};
                                for (var _b = 0, _c = select.projectedColumns; _b < _c.length; _b++) {
                                    var col = _c[_b];
                                    item[col.dataPropertyName] = _this.generateValue(col);
                                }
                                for (var prop in propValueMap) {
                                    item[prop] = propValueMap[prop];
                                }
                                rows.push(item);
                                for (var _d = 0, relMap_1 = relMap; _d < relMap_1.length; _d++) {
                                    var _e = relMap_1[_d], parentCol = _e[0], entityCol = _e[1];
                                    item[entityCol.propertyName] = parent_1[parentCol.propertyName];
                                }
                            }
                        }
                    }
                    else {
                        var maxRowCount = _this.getMaxCount(select, query, 10);
                        var numberOfRecord = Math.floor(Math.random() * maxRowCount) + 1;
                        for (var i = 0; i < numberOfRecord; i++) {
                            var item = {};
                            for (var _f = 0, _g = select.projectedColumns; _f < _g.length; _f++) {
                                var col = _g[_f];
                                item[col.dataPropertyName] = _this.generateValue(col);
                            }
                            for (var prop in propValueMap) {
                                item[prop] = propValueMap[prop];
                            }
                            rows.push(item);
                        }
                    }
                };
                for (var _i = 0, selects_1 = selects; _i < selects_1.length; _i++) {
                    var select = selects_1[_i];
                    _loop_1(select);
                }
                var generatedResults_1 = Array.from(map.values());
                var index_1 = 0;
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    if (query.type & Enum_1.QueryType.DML) {
                        if (tvps[index_1]) {
                            var paramValue = tvps[index_1][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    else if (query.type & Enum_1.QueryType.DQL) {
                        var rows = generatedResults_1[index_1++];
                        result.rows = rows;
                    }
                    return result;
                });
            }
            else if (command instanceof InsertExpression_1.InsertExpression) {
                var i_2 = 0;
                var generatedColumns_1 = command.entity.columns.where(function (col) { return !(0, Util_1.isNull)(col.columnMeta); })
                    .where(function (col) { return (col.columnMeta.generation & Enum_1.ColumnGeneration.Insert) !== 0 || !!col.columnMeta.defaultExp; }).toArray();
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    i_2++;
                    if (query.type & Enum_1.QueryType.DQL) {
                        var rows = command.values.select(function (v) {
                            var val = {};
                            for (var _i = 0, generatedColumns_2 = generatedColumns_1; _i < generatedColumns_2.length; _i++) {
                                var col = generatedColumns_2[_i];
                                var paramExp = v[col.dataPropertyName];
                                val[col.dataPropertyName] = paramExp ? query.parameters[paramExp.name]
                                    : _this.generateValue(col);
                            }
                            return val;
                        }).toArray();
                        result.rows = rows;
                    }
                    if (query.type & Enum_1.QueryType.DML) {
                        if (i_2 >= skipCount) {
                            result.effectedRows = command.values.length;
                        }
                        else {
                            var paramValue = tvps[i_2][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof UpdateExpression_1.UpdateExpression) {
                var i_3 = 0;
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    if (query.type & Enum_1.QueryType.DML) {
                        i_3++;
                        if (i_3 < skipCount) {
                            var paramValue = tvps[i_3][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof DeleteExpression_1.DeleteExpression) {
                var i_4 = 0;
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    if (query.type & Enum_1.QueryType.DML) {
                        i_4++;
                        if (i_4 < skipCount) {
                            var paramValue = tvps[i_4][1];
                            if (Array.isArray(paramValue)) {
                                result.effectedRows = paramValue.length;
                            }
                        }
                    }
                    return result;
                });
            }
            else if (command instanceof UpsertExpression_1.UpsertExpression) {
                var dmlCount_1 = deferred.queries.where(function (query) { return (query.type & Enum_1.QueryType.DML) !== 0; }).count();
                var i_5 = 0;
                return deferred.queries.select(function (query) {
                    var result = {
                        effectedRows: 1
                    };
                    if (query.type & Enum_1.QueryType.DML) {
                        i_5++;
                        if (i_5 !== dmlCount_1) {
                            var paramValue = tvps[i_5][1];
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
    };
    MockConnection.prototype.generateValue = function (column) {
        if (column.columnMeta) {
            var columnMeta = column.columnMeta;
            if (columnMeta.defaultExp) {
                return ExpressionExecutor_1.ExpressionExecutor.execute(columnMeta.defaultExp.body);
            }
        }
        switch (column.type) {
            case Uuid_1.Uuid:
                return Uuid_1.Uuid.new().toString();
            case Number:
                var fix = 2;
                if (column.columnMeta && column.columnMeta instanceof IntegerColumnMetaData_1.IntegerColumnMetaData) {
                    fix = 0;
                }
                return Number((Math.random() * 10000 + 1).toFixed(fix));
            case String: {
                var result = "";
                var number = Math.random() * 100 + 1;
                if (column.columnMeta && column.columnMeta instanceof StringColumnMetaData_1.StringColumnMetaData && column.columnMeta.length > 0) {
                    number = column.columnMeta.length;
                }
                for (var i = 0; i < number; i++) {
                    var char = String.fromCharCode(Math.round(Math.random() * 90) + 32);
                    if (/[^a-z ]/i.test(char)) {
                        char = charList[Math.floor(Math.random() * charList.length)];
                    }
                    result += char;
                }
                return result;
            }
            case Date: {
                var number = Math.round(Math.random() * 31536000000) + 1514653200000;
                return new Date(number);
            }
            case TimeSpan_1.TimeSpan: {
                var number = Math.round(Math.random() * 86400000);
                return new TimeSpan_1.TimeSpan(number);
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
                var size = Math.floor((Math.random() * 16) + 1);
                var values = Array(size);
                for (var i = 0; i < size; i++) {
                    values[0] = Math.floor(Math.random() * 256);
                }
                var result = new Uint8Array(values);
                return result;
            }
        }
        return null;
    };
    MockConnection.prototype.open = function () {
        return Promise.resolve();
    };
    MockConnection.prototype.query = function () {
        var commands = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            commands[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                count = commands.length || 1;
                return [2 /*return*/, this.results.splice(0, count)];
            });
        });
    };
    MockConnection.prototype.reset = function () {
        return Promise.resolve();
    };
    MockConnection.prototype.rollbackTransaction = function () {
        this._isolationLevel = this._transactions.pop();
        return Promise.resolve();
    };
    MockConnection.prototype.setIsolationLevel = function (isolationLevel) {
        this._isolationLevel = isolationLevel;
        return Promise.resolve();
    };
    MockConnection.prototype.setQueries = function (deferredQueries) {
        this._deferredQueries = deferredQueries;
        this._generatedResults = null;
    };
    MockConnection.prototype.startTransaction = function (isolationLevel) {
        this._transactions.push(this._isolationLevel);
        this.setIsolationLevel(isolationLevel);
        return Promise.resolve();
    };
    MockConnection.prototype.extractValue = function (query, exp) {
        if (exp instanceof ValueExpression_1.ValueExpression) {
            return ExpressionExecutor_1.ExpressionExecutor.execute(exp);
        }
        else if (query.parameters && exp instanceof SqlParameterExpression_1.SqlParameterExpression) {
            var value = query.parameters[exp.name];
            if (value !== undefined) {
                return value;
            }
        }
        return null;
    };
    MockConnection.prototype.flattenSelectExpression = function (selectExp) {
        var results = [selectExp];
        for (var i = 0; i < results.length; i++) {
            var select = results[i];
            var addition = select.resolvedIncludes.select(function (o) { return o.child; }).toArray();
            results.splice.apply(results, __spreadArray([i + 1, 0], addition, false));
        }
        return results;
    };
    MockConnection.prototype.getMaxCount = function (select, query, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 10; }
        if (select.paging && select.paging.take) {
            defaultValue = this.extractValue(query, select.paging.take);
        }
        else {
            var takeJoin = select.joins.first(function (o) { return o instanceof PagingJoinRelation_1.PagingJoinRelation; });
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
    };
    return MockConnection;
}());
exports.MockConnection = MockConnection;
