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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDAO = exports.BaseDAOInsertMode = void 0;
var index_mjs_1 = require("./query/index.mjs");
/**
 *
 * @export
 * @enum
 */
var BaseDAOInsertMode;
(function (BaseDAOInsertMode) {
    /** use the provided value if defined, otherwise let sqlite generate the value automatically */
    BaseDAOInsertMode[BaseDAOInsertMode["StrictSqlite"] = 1] = "StrictSqlite";
    /** prevents the insertion of predefined primary key values; always let sqlite generate a value automatically */
    BaseDAOInsertMode[BaseDAOInsertMode["ForceAutoGeneration"] = 2] = "ForceAutoGeneration";
})(BaseDAOInsertMode || (exports.BaseDAOInsertMode = BaseDAOInsertMode = {}));
/**
 *
 *
 * @export
 * @class BaseDAO
 * @template T - The class mapped to the base table
 */
var BaseDAO = /** @class */ (function () {
    /**
     * Creates an instance of BaseDAO.
     *
     * @param type - The class mapped to the base table
     * @param sqldb - The database connection
     */
    function BaseDAO(type, sqldb) {
        this.type = type;
        this.queryModel = new index_mjs_1.QueryModel(this.type);
        this.metaModel = this.queryModel.metaModel;
        this.table = this.queryModel.table;
        this.sqldb = sqldb;
    }
    /**
     * insert
     *
     * @param model - A model class instance
     * @returns A promise of the inserted model class instance
     */
    BaseDAO.prototype.insert = function (model, mode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.insertInternal(model, undefined, mode)];
            });
        });
    };
    /**
     * insert partially - insert only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all columns mapped to excluded properties must be nullable or must have a database default value
     *
     * @param input - A model class instance
     * @returns A promise of the inserted model class instance
     */
    BaseDAO.prototype.insertPartial = function (input, mode) {
        return __awaiter(this, void 0, void 0, function () {
            var keys;
            return __generator(this, function (_a) {
                keys = Object.keys(input);
                return [2 /*return*/, this.insertInternal(input, keys, mode)];
            });
        });
    };
    /**
     * replace ( insert or replace )
     *
     * @param model - A model class instance
     * @returns A promise of the inserted or updated model class instance
     */
    BaseDAO.prototype.replace = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.insertOrReplaceInternal(model)];
            });
        });
    };
    /**
     * replace ( insert or replace ) partially
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * on insert: all columns mapped to excluded properties must be nullable or must have a database default value
     * on update: all columns mapped to excluded properties are not affected by this update
     *
     * @param input - A model class instance
     * @returns A promise of the inserted or updated model class instance
     */
    BaseDAO.prototype.replacePartial = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var keys;
            return __generator(this, function (_a) {
                keys = Object.keys(input);
                return [2 /*return*/, this.insertOrReplaceInternal(input, keys)];
            });
        });
    };
    /**
     * update
     *
     * @param model - A model class instance
     * @returns A promise of the updated model class instance
     */
    BaseDAO.prototype.update = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateInternal(model)];
            });
        });
    };
    /**
     * update partially - update only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all other columns are not affected by this update
     *
     * @param input - A model class instance
     * @returns A promise of the updated model class instance
     */
    BaseDAO.prototype.updatePartial = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var keys;
            return __generator(this, function (_a) {
                keys = Object.keys(input);
                return [2 /*return*/, this.updateInternal(input, keys)];
            });
        });
    };
    /**
     * update all - please provide a proper sql-condition otherwise all records will be updated!
     * this updates only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all other columns are not affected by this update
     *
     * @param input - A model class instance
     * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the updated model class instance
     */
    BaseDAO.prototype.updatePartialAll = function (input, where, params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var keys, sql, whereClause, res, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        keys = Object.keys(input);
                        sql = this.queryModel.getUpdateAllStatement(keys);
                        params = Object.assign({}, this.queryModel.bindAllInputParams(input, keys), params);
                        return [4 /*yield*/, this.queryModel.getWhereClause(this.toFilter(where), params)];
                    case 1:
                        whereClause = _b.sent();
                        sql += "  ".concat(whereClause);
                        return [4 /*yield*/, this.sqldb.run(sql, params)];
                    case 2:
                        res = _b.sent();
                        if (!res.changes && !((_a = BaseDAO.options) === null || _a === void 0 ? void 0 : _a.ignoreNoChanges)) {
                            // TODO: Breaking Change: change to: BaseDAO.options?.ignoreNoChanges !== false
                            return [2 /*return*/, Promise.reject(new Error("update '".concat(this.table.name, "' failed: nothing changed")))];
                        }
                        return [2 /*return*/, res.changes];
                    case 3:
                        e_1 = _b.sent();
                        return [2 /*return*/, Promise.reject(new Error("update '".concat(this.table.name, "' failed: ").concat(e_1.message)))];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * delete using primary key
     *
     * @param model - A model class instance
     * @returns A promise
     */
    BaseDAO.prototype.delete = function (model) {
        return this.deleteById(model);
    };
    /**
     * delete using primary key
     *
     * @param input - A partial model class instance
     * @returns A promise
     */
    BaseDAO.prototype.deleteById = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sqldb.run(this.queryModel.getDeleteByIdStatement(), this.queryModel.bindPrimaryKeyInputParams(input))];
                    case 1:
                        res = _a.sent();
                        if (!res.changes) {
                            return [2 /*return*/, Promise.reject(new Error("delete from '".concat(this.table.name, "' failed: nothing changed")))];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        // NOTE: should not happen
                        /* istanbul ignore next */
                        return [2 /*return*/, Promise.reject(new Error("delete from '".concat(this.table.name, "' failed: ").concat(e_2.message)))];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * delete all - please provide a proper sql-condition otherwise all records will be deleted!
     *
     * @param [where] - An optional Where-object or sql-text which will be added to the delete-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise
     */
    BaseDAO.prototype.deleteAll = function (where, params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var sql, whereClause, res, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        sql = this.queryModel.getDeleteAllStatement();
                        params = Object.assign({}, params);
                        return [4 /*yield*/, this.queryModel.getWhereClause(this.toFilter(where), params)];
                    case 1:
                        whereClause = _b.sent();
                        sql += "  ".concat(whereClause);
                        return [4 /*yield*/, this.sqldb.run(sql, params)];
                    case 2:
                        res = _b.sent();
                        if (!res.changes && !((_a = BaseDAO.options) === null || _a === void 0 ? void 0 : _a.ignoreNoChanges)) {
                            // TODO: Breaking Change: change to: BaseDAO.options?.ignoreNoChanges !== false
                            return [2 /*return*/, Promise.reject(new Error("delete from '".concat(this.table.name, "' failed: nothing changed")))];
                        }
                        return [2 /*return*/, Promise.resolve(res.changes)];
                    case 3:
                        e_3 = _b.sent();
                        return [2 /*return*/, Promise.reject(new Error("delete from '".concat(this.table.name, "' failed: ").concat(e_3.message)))];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Select a given model
     *
     * @param model - The input/output model
     * @returns A promise of the model instance
     */
    BaseDAO.prototype.select = function (model) {
        return this.queryModel.selectModel(this.sqldb, model);
    };
    /**
     * select using primary key
     *
     * @param input - A partial model class instance
     * @returns A promise of the model instance
     */
    BaseDAO.prototype.selectById = function (input) {
        return this.queryModel.selectModelById(this.sqldb, input);
    };
    /**
     * select parent by using a foreign key constraint and a given child instance
     *
     * @template C - The class mapped to the child table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param childType - The class mapped to the childtable
     * @param childObj - An instance of the class mapped to the child table
     * @returns A promise of model instance
     */
    BaseDAO.prototype.selectByChild = function (constraintName, childType, childObj) {
        return __awaiter(this, void 0, void 0, function () {
            var childDAO, output, fkProps, cols, refNotFoundCols, props, s, hostParams, i, stmt, row, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        childDAO = new BaseDAO(childType, this.sqldb);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        fkProps = childDAO.queryModel.getForeignKeyProps(constraintName);
                        cols = childDAO.queryModel.getForeignKeyRefCols(constraintName);
                        /* istanbul ignore if */
                        if (!fkProps || !cols) {
                            throw new Error("in '".concat(childDAO.metaModel.name, "': constraint '").concat(constraintName, "' is not defined"));
                        }
                        refNotFoundCols = [];
                        props = this.queryModel.getPropertiesFromColumnNames(cols, refNotFoundCols);
                        /* istanbul ignore if */
                        if (!props || refNotFoundCols.length) {
                            s = '"' + refNotFoundCols.join('", "') + '"';
                            throw new Error("in '".concat(this.metaModel.name, "': no property mapped to these fields: ").concat(s));
                        }
                        hostParams = {};
                        for (i = 0; i < fkProps.length; ++i) {
                            this.queryModel.setHostParamValue(hostParams, props[i], fkProps[i].getDBValueFromModel(childObj));
                        }
                        stmt = this.queryModel.getSelectAllStatement(undefined, index_mjs_1.TABLEALIAS);
                        stmt += '\nWHERE\n  ';
                        stmt += props
                            .map(function (prop) { return "".concat(index_mjs_1.TABLEALIAS, ".").concat(prop.field.quotedName, "=").concat(prop.getHostParameterName()); })
                            .join(' AND ');
                        return [4 /*yield*/, this.sqldb.get(stmt, hostParams)];
                    case 2:
                        row = _a.sent();
                        output = this.queryModel.updateModelFromRow(new this.type(), row);
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(new Error("select '".concat(this.table.name, "' failed: ").concat(e_4.message)))];
                    case 4: return [2 /*return*/, output];
                }
            });
        });
    };
    /**
     * select parent by using a foreign key constraint and a given child instance
     *
     * @template P - The class mapped to the parent table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param parentType - The class mapped to the parent table
     * @param childObj - An instance of the class mapped to the child table
     * @returns A promise of model instance
     */
    BaseDAO.prototype.selectParentOf = function (constraintName, parentType, childObj) {
        var parentDAO = new BaseDAO(parentType, this.sqldb);
        return parentDAO.selectByChild(constraintName, this.type, childObj);
    };
    /**
     * Select one model using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the selected model instance; rejects if result is not exactly one row
     */
    BaseDAO.prototype.selectOne = function (whereOrFilter, params) {
        return this.queryModel.selectOne(this.sqldb, this.toFilter(whereOrFilter, index_mjs_1.TABLEALIAS), params);
    };
    /**
     * Select all models using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    BaseDAO.prototype.selectAll = function (whereOrFilter, params) {
        return this.queryModel.selectAll(this.sqldb, this.toFilter(whereOrFilter, index_mjs_1.TABLEALIAS), params);
    };
    /**
     * Count all models using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the count value
     */
    BaseDAO.prototype.countAll = function (whereOrFilter, params) {
        return this.queryModel.countAll(this.sqldb, this.toFilter(whereOrFilter, index_mjs_1.TABLEALIAS), params);
    };
    /**
     * check if model exist using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the count value
     */
    BaseDAO.prototype.exists = function (whereOrFilter, params) {
        return this.queryModel.exists(this.sqldb, this.toFilter(whereOrFilter, index_mjs_1.TABLEALIAS), params);
    };
    /**
     * Select all partial models using a filter
     *
     * @param filter - A Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    BaseDAO.prototype.selectPartialAll = function (filter, params) {
        return this.queryModel.selectPartialAll(this.sqldb, filter, params);
    };
    /**
     * select all childs using a foreign key constraint and a given parent instance
     *
     * @template P - The class mapped to the parent table
     * @param constraintName - The foreign key constraint
     * @param parentType - The class mapped to the parent table
     * @param parentObj - An instance of the class mapped to the parent table
     * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    BaseDAO.prototype.selectAllOf = function (constraintName, parentType, parentObj, whereOrFilter, params) {
        return __awaiter(this, void 0, void 0, function () {
            var fkPredicates, stmt, parentDAO, childParams, rows, results_1, e_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fkPredicates = this.queryModel.getForeignKeyPredicates(constraintName);
                        if (!fkPredicates) {
                            throw new Error("constraint '".concat(constraintName, "' is not defined"));
                        }
                        stmt = this.queryModel.getSelectAllStatement(undefined, index_mjs_1.TABLEALIAS);
                        stmt += '\nWHERE\n';
                        stmt += "  ".concat(index_mjs_1.TABLEALIAS, ".") + fkPredicates.join(" AND ".concat(index_mjs_1.TABLEALIAS, "."));
                        if (whereOrFilter) {
                            stmt += ' ';
                            stmt += whereOrFilter;
                        }
                        parentDAO = new BaseDAO(parentType, this.sqldb);
                        childParams = this.queryModel.bindForeignParams(parentDAO.queryModel, constraintName, parentObj, params);
                        return [4 /*yield*/, this.sqldb.all(stmt, childParams)];
                    case 1:
                        rows = _a.sent();
                        results_1 = [];
                        rows.forEach(function (row) {
                            results_1.push(_this.queryModel.updateModelFromRow(new _this.type(), row));
                        });
                        return [2 /*return*/, results_1];
                    case 2:
                        e_5 = _a.sent();
                        return [2 /*return*/, Promise.reject(new Error("select '".concat(this.table.name, "' failed: ").concat(e_5.message)))];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * select all childs using a foreign key constraint and a given parent instance
     *
     * @template C - The class mapped to the child table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param childType - The class mapped to the childtable
     * @param parentObj - An instance of the class mapped to the parent table
     * @param [where] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    BaseDAO.prototype.selectAllChildsOf = function (constraintName, childType, parentObj, where, params) {
        var childDAO = new BaseDAO(childType, this.sqldb);
        return childDAO.selectAllOf(constraintName, this.type, parentObj, where, params);
    };
    /**
     * perform:
     * select T.<col1>,.. FROM <table> T
     *
     * @param callback - The callback called for each row
     * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                     e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise
     */
    BaseDAO.prototype.selectEach = function (callback, whereOrFilter, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.queryModel.selectEach(this.sqldb, callback, this.toFilter(whereOrFilter, index_mjs_1.TABLEALIAS), params)];
            });
        });
    };
    /**
     * create a table in the database
     *
     * @returns {Promise<void>}
     */
    BaseDAO.prototype.createTable = function (force) {
        return this.sqldb.exec(this.table.getCreateTableStatement(force));
    };
    /**
     * drop a table from the database
     *
     * @returns {Promise<void>}
     */
    BaseDAO.prototype.dropTable = function () {
        return this.sqldb.exec(this.table.getDropTableStatement());
    };
    /**
     * add a column/field to a database table
     *
     * @param colName - The column/field to add
     * @returns A promise
     */
    BaseDAO.prototype.alterTableAddColumn = function (colName) {
        return this.sqldb.exec(this.table.getAlterTableAddColumnStatement(colName));
    };
    /**
     * create index in the database
     *
     * @param idxName - The name of the index
     * @param [unique] - create unique index
     * @returns A promise
     */
    BaseDAO.prototype.createIndex = function (idxName, unique) {
        return this.sqldb.exec(this.table.getCreateIndexStatement(idxName, unique));
    };
    /**
     * drop an index from the database
     *
     * @param idxName - The name of the index
     * @returns A promise
     */
    BaseDAO.prototype.dropIndex = function (idxName) {
        return this.sqldb.exec(this.table.getDropIndexStatement(idxName));
    };
    BaseDAO.prototype.toFilter = function (whereOrFilter, tableAlias) {
        if (whereOrFilter && (0, index_mjs_1.isFilter)(whereOrFilter)) {
            return whereOrFilter;
        }
        return { where: whereOrFilter, tableAlias: tableAlias };
    };
    BaseDAO.prototype.insertInternal = function (input, keys, mode) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var insertMode, stmt, params, idProperty, res, operation, e_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        insertMode = mode || ((_a = BaseDAO.options) === null || _a === void 0 ? void 0 : _a.insertMode);
                        stmt = this.queryModel.getInsertIntoStatement(keys);
                        params = this.queryModel.bindAllInputParams(input, keys);
                        idProperty = this.table.rowIdField
                            ? this.metaModel.mapColNameToProp.get(this.table.rowIdField.name)
                            : undefined;
                        if (idProperty && idProperty.getDBValueFromModel(input) != undefined) {
                            if ((insertMode === undefined && this.table.autoIncrementField) ||
                                insertMode === BaseDAOInsertMode.ForceAutoGeneration) {
                                params[idProperty.getHostParameterName()] = null;
                            }
                        }
                        return [4 /*yield*/, this.sqldb.run(stmt, params)];
                    case 1:
                        res = _b.sent();
                        if (idProperty) {
                            /* istanbul ignore if */
                            if (res.lastID == undefined) {
                                operation = this.table.autoIncrementField ? 'AUTOINCREMENT' : 'ROWID';
                                return [2 /*return*/, Promise.reject(new Error("insert into '".concat(this.table.name, "' using ").concat(operation, " failed: 'lastID' is null or undefined")))];
                            }
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            res[this.table.rowIdField.name] = res.lastID;
                            /* istanbul ignore else */
                            idProperty.setDBValueIntoModel(input, res.lastID);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_6 = _b.sent();
                        return [2 /*return*/, Promise.reject(new Error("insert into '".concat(this.table.name, "' failed: ").concat(e_6.message)))];
                    case 3: return [2 /*return*/, input];
                }
            });
        });
    };
    BaseDAO.prototype.insertOrReplaceInternal = function (input, keys) {
        return __awaiter(this, void 0, void 0, function () {
            var res, autoProp, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sqldb.run(this.queryModel.getInsertOrReplaceStatement(keys), this.queryModel.bindAllInputParams(input, keys))];
                    case 1:
                        res = _a.sent();
                        if (this.table.autoIncrementField) {
                            /* istanbul ignore if */
                            if (res.lastID == undefined) {
                                // NOTE: should not happen
                                return [2 /*return*/, Promise.reject(new Error("replace into '${this.table.name}' failed: autoincrement failed"))];
                            }
                            autoProp = this.metaModel.mapColNameToProp.get(this.table.autoIncrementField.name);
                            /* istanbul ignore else */
                            if (autoProp) {
                                autoProp.setDBValueIntoModel(input, res.lastID);
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_7 = _a.sent();
                        return [2 /*return*/, Promise.reject(new Error("replace into '".concat(this.table.name, "' failed: ").concat(e_7.message)))];
                    case 3: return [2 /*return*/, input];
                }
            });
        });
    };
    BaseDAO.prototype.updateInternal = function (input, keys) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sqldb.run(this.queryModel.getUpdateByIdStatement(keys), this.queryModel.bindAllInputParams(input, keys, true))];
                    case 1:
                        res = _a.sent();
                        if (!res.changes) {
                            return [2 /*return*/, Promise.reject(new Error("update '".concat(this.table.name, "' failed: nothing changed")))];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        return [2 /*return*/, Promise.reject(new Error("update '".concat(this.table.name, "' failed: ").concat(e_8.message)))];
                    case 3: return [2 /*return*/, input];
                }
            });
        });
    };
    return BaseDAO;
}());
exports.BaseDAO = BaseDAO;
// BaseDAO.options = { insertMode: BaseDAOInsertMode.StrictSqlite };
// BaseDAO.options = { insertMode: BaseDAOInsertMode.ForceAutoGeneration };
