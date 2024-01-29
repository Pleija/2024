"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.DbSet = void 0;
var Enum_1 = require("../Common/Enum");
var ParameterStack_1 = require("../Common/ParameterStack");
var DecoratorKey_1 = require("../Decorator/DecoratorKey");
var Enumerable_1 = require("../Enumerable/Enumerable");
var Util_1 = require("../Helper/Util");
var BulkDeferredQuery_1 = require("../Query/DeferredQuery/BulkDeferredQuery");
var Queryable_1 = require("../Queryable/Queryable");
var EntityExpression_1 = require("../Queryable/QueryExpression/EntityExpression");
var SelectExpression_1 = require("../Queryable/QueryExpression/SelectExpression");
var EntityEntry_1 = require("./EntityEntry");
var DbSet = /** @class */ (function (_super) {
    __extends(DbSet, _super);
    function DbSet(type, dbContext) {
        var _this = _super.call(this, type) || this;
        _this.type = type;
        _this.dictionary = new Map();
        _this._dbContext = dbContext;
        _this._param = {
            node: new ParameterStack_1.ParameterStack(),
            childrens: []
        };
        return _this;
    }
    Object.defineProperty(DbSet.prototype, "stackTree", {
        get: function () {
            return this._param;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DbSet.prototype, "dbContext", {
        get: function () {
            return this._dbContext;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DbSet.prototype, "local", {
        get: function () {
            return Enumerable_1.Enumerable.from(this.dictionary).select(function (o) { return o[1].entity; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DbSet.prototype, "metaData", {
        get: function () {
            if (!this._metaData) {
                this._metaData = Reflect.getOwnMetadata(DecoratorKey_1.entityMetaKey, this.type);
            }
            return this._metaData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DbSet.prototype, "primaryKeys", {
        get: function () {
            return this.metaData.primaryKeys;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DbSet.prototype, "queryOption", {
        get: function () {
            return {};
        },
        enumerable: false,
        configurable: true
    });
    DbSet.prototype.buildQuery = function (visitor) {
        var result = new SelectExpression_1.SelectExpression(new EntityExpression_1.EntityExpression(this.type, visitor.newAlias()));
        result.parameterTree = {
            node: [],
            childrens: []
        };
        visitor.setDefaultBehaviour(result);
        return result;
    };
    DbSet.prototype.clear = function () {
        this.dictionary = new Map();
    };
    DbSet.prototype.deferredDelete = function (modeOrKeyOrPredicate, mode) {
        if (modeOrKeyOrPredicate instanceof Function || typeof modeOrKeyOrPredicate === "string") {
            return _super.prototype.deferredDelete.call(this, modeOrKeyOrPredicate, mode);
        }
        else {
            return this.dbContext.getDeleteQuery(this.entry(modeOrKeyOrPredicate), mode);
        }
    };
    DbSet.prototype.deferredInsert = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!items.any()) {
            throw new Error("empty items");
        }
        if (!Reflect.getOwnMetadata(DecoratorKey_1.entityMetaKey, this.type)) {
            throw new Error("Only entity supported");
        }
        var defers = [];
        for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
            var item = items_1[_a];
            var entry = this.entry(item);
            defers.push(this.dbContext.getInsertQuery(entry));
        }
        return new BulkDeferredQuery_1.BulkDeferredQuery(this.dbContext, defers);
    };
    // Prevent Update all records
    DbSet.prototype.update = function (item) {
        return this.deferredUpdate(item).execute();
    };
    // Prevent Update all records
    DbSet.prototype.deferredUpdate = function (item) {
        return this.dbContext.getUpdateQuery(this.dbContext.entry(item));
    };
    DbSet.prototype.deferredUpsert = function (item) {
        return this.dbContext.getUpsertQuery(this.dbContext.add(item));
    };
    DbSet.prototype.entry = function (entity) {
        var key = this.getKey(entity);
        var entry = this.dictionary.get(key);
        if (entry) {
            if (entry.entity !== entity) {
                entry.setOriginalValues(entity);
            }
        }
        else {
            if (!(entity instanceof this.type)) {
                var entityType = new this.type();
                entry = new EntityEntry_1.EntityEntry(this, entityType, key);
                entry.setOriginalValues(entity);
            }
            else {
                entry = new EntityEntry_1.EntityEntry(this, entity, key);
            }
            this.dictionary.set(key, entry);
        }
        return entry;
    };
    DbSet.prototype.find = function (id, forceReload) {
        return __awaiter(this, void 0, void 0, function () {
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entity = forceReload ? null : this.findLocal(id);
                        if (!!entity) return [3 /*break*/, 2];
                        return [4 /*yield*/, _super.prototype.find.call(this, id)];
                    case 1:
                        entity = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, entity];
                }
            });
        });
    };
    DbSet.prototype.findLocal = function (id) {
        var key = this.getKey(id);
        var entry = this.dictionary.get(key);
        return entry ? entry.entity : undefined;
    };
    DbSet.prototype.getKey = function (id) {
        if ((0, Util_1.isNull)(id)) {
            throw new Error("Parameter cannot be null");
        }
        if ((0, Util_1.isValue)(id)) {
            return id.toString();
        }
        var keyString = "";
        var useReference = false;
        for (var _i = 0, _a = this.primaryKeys; _i < _a.length; _i++) {
            var o = _a[_i];
            var val = id[o.propertyName];
            if (!val) {
                if (o.generation & Enum_1.ColumnGeneration.Insert) {
                    useReference = true;
                }
                else {
                    throw new Error("primary key \"".concat(o.propertyName.toString(), "\" required"));
                }
                break;
            }
            else {
                keyString += val.toString() + "|";
            }
        }
        if (useReference) {
            return id;
        }
        return keyString.slice(0, -1);
    };
    DbSet.prototype.hashCode = function () {
        return (0, Util_1.hashCode)(this.type.name);
    };
    DbSet.prototype.insert = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return this.deferredInsert.apply(this, items).execute().then(function (o) { return o.sum(); });
    };
    DbSet.prototype.new = function (primaryValue) {
        var entity = new this.type();
        if ((0, Util_1.isValue)(primaryValue)) {
            if (this.primaryKeys.length !== 1) {
                throw new Error("".concat(this.type.name, " has multiple primary keys"));
            }
            entity[this.primaryKeys.first().propertyName] = primaryValue;
        }
        else {
            if (this.primaryKeys.any(function (o) { return !(o.generation & Enum_1.ColumnGeneration.Insert) && !o.defaultExp && !primaryValue[o.propertyName]; })) {
                throw new Error("Primary keys is required");
            }
            for (var prop in primaryValue) {
                entity[prop] = primaryValue[prop];
            }
        }
        this.dbContext.add(entity);
        return entity;
    };
    DbSet.prototype.updateEntryKey = function (entry) {
        this.dictionary.delete(entry.key);
        entry.key = this.getKey(entry.entity);
        this.dictionary.set(entry.key, entry);
    };
    DbSet.prototype.upsert = function (item) {
        return this.deferredUpsert(item).execute();
    };
    return DbSet;
}(Queryable_1.Queryable));
exports.DbSet = DbSet;
