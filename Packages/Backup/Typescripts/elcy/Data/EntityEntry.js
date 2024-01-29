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
exports.EntityEntry = void 0;
var DecoratorKey_1 = require("../Decorator/DecoratorKey");
var EventHandlerFactory_1 = require("../Event/EventHandlerFactory");
var FunctionExpression_1 = require("../ExpressionBuilder/Expression/FunctionExpression");
var MemberAccessExpression_1 = require("../ExpressionBuilder/Expression/MemberAccessExpression");
var ParameterExpression_1 = require("../ExpressionBuilder/Expression/ParameterExpression");
var ExpressionExecutor_1 = require("../ExpressionBuilder/ExpressionExecutor");
var ComputedColumnMetaData_1 = require("../MetaData/ComputedColumnMetaData");
var EmbeddedColumnMetaData_1 = require("../MetaData/EmbeddedColumnMetaData");
var EntityState_1 = require("./EntityState");
var RelationEntry_1 = require("./RelationEntry");
var RelationState_1 = require("./RelationState");
var EntityEntry = /** @class */ (function () {
    function EntityEntry(dbSet, entity, key) {
        var _a, _b;
        var _this = this;
        this.dbSet = dbSet;
        this.entity = entity;
        this.key = key;
        this.enableTrackChanges = true;
        this.relationMap = {};
        this._originalValues = new Map();
        this._state = EntityState_1.EntityState.Detached;
        var propertyChangeHandler = entity[DecoratorKey_1.propertyChangeHandlerMetaKey];
        if (!propertyChangeHandler) {
            var propertyChangeDispatcher = void 0;
            _a = (0, EventHandlerFactory_1.EventHandlerFactory)(entity), propertyChangeHandler = _a[0], propertyChangeDispatcher = _a[1];
            entity[DecoratorKey_1.propertyChangeHandlerMetaKey] = propertyChangeHandler;
            entity[DecoratorKey_1.propertyChangeDispatherMetaKey] = propertyChangeDispatcher;
        }
        propertyChangeHandler.add(function (source, args) { return _this.onPropertyChanged(args); });
        var relationChangeHandler = entity[DecoratorKey_1.relationChangeHandlerMetaKey];
        if (!relationChangeHandler) {
            var relationChangeDispatcher = void 0;
            _b = (0, EventHandlerFactory_1.EventHandlerFactory)(entity), relationChangeHandler = _b[0], relationChangeDispatcher = _b[1];
            entity[DecoratorKey_1.relationChangeHandlerMetaKey] = relationChangeHandler;
            entity[DecoratorKey_1.relationChangeDispatherMetaKey] = relationChangeDispatcher;
        }
        relationChangeHandler.add(function (source, args) { return _this.onRelationChanged(args); });
    }
    Object.defineProperty(EntityEntry.prototype, "isCompletelyLoaded", {
        get: function () {
            var _this = this;
            return this.dbSet.metaData.columns.where(function (o) { return !(o instanceof ComputedColumnMetaData_1.ComputedColumnMetaData); })
                .all(function (o) { return _this.entity[o.propertyName] !== undefined; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntityEntry.prototype, "metaData", {
        get: function () {
            return this.dbSet.metaData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EntityEntry.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (value) {
            if (this._state !== value) {
                var dbContext = this.dbSet.dbContext;
                switch (this.state) {
                    case EntityState_1.EntityState.Added: {
                        var typedAddEntries = dbContext.entityEntries.add.get(this.metaData);
                        if (typedAddEntries) {
                            typedAddEntries.delete(this);
                        }
                        break;
                    }
                    case EntityState_1.EntityState.Deleted: {
                        var typedEntries = dbContext.entityEntries.delete.get(this.metaData);
                        if (typedEntries) {
                            typedEntries.delete(this);
                        }
                        break;
                    }
                    case EntityState_1.EntityState.Modified: {
                        var typedEntries = dbContext.entityEntries.update.get(this.metaData);
                        if (typedEntries) {
                            typedEntries.delete(this);
                        }
                        break;
                    }
                    case EntityState_1.EntityState.Detached: {
                        // load all relation
                        break;
                    }
                }
                switch (value) {
                    case EntityState_1.EntityState.Added: {
                        var typedEntries = dbContext.entityEntries.add.get(this.metaData);
                        if (!typedEntries) {
                            typedEntries = [];
                            dbContext.entityEntries.add.set(this.metaData, typedEntries);
                        }
                        typedEntries.push(this);
                        break;
                    }
                    case EntityState_1.EntityState.Deleted: {
                        var typedEntries = dbContext.entityEntries.delete.get(this.metaData);
                        if (!typedEntries) {
                            typedEntries = [];
                            dbContext.entityEntries.delete.set(this.metaData, typedEntries);
                        }
                        typedEntries.push(this);
                        break;
                    }
                    case EntityState_1.EntityState.Modified: {
                        var typedEntries = dbContext.entityEntries.update.get(this.metaData);
                        if (!typedEntries) {
                            typedEntries = [];
                            dbContext.entityEntries.update.set(this.metaData, typedEntries);
                        }
                        typedEntries.push(this);
                        break;
                    }
                }
                this._state = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    EntityEntry.prototype.acceptChanges = function () {
        var _this = this;
        var properties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            properties[_i] = arguments[_i];
        }
        if (properties.any() && this.state !== EntityState_1.EntityState.Modified) {
            return;
        }
        switch (this.state) {
            case EntityState_1.EntityState.Modified: {
                var acceptedProperties = [];
                if (properties.any()) {
                    for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
                        var prop = properties_1[_a];
                        var isDeleted = this._originalValues.delete(prop);
                        if (isDeleted) {
                            acceptedProperties.push(prop);
                        }
                    }
                }
                else {
                    acceptedProperties = Array.from(this._originalValues.keys());
                    this._originalValues.clear();
                }
                var _loop_1 = function (prop) {
                    // reflect update option
                    var relations = this_1.metaData.relations
                        .where(function (rel) { return rel.isMaster && rel.relationColumns.any(function (o) { return o.propertyName === prop; })
                        && (rel.updateOption === "CASCADE" || rel.updateOption === "SET NULL" || rel.updateOption === "SET DEFAULT"); });
                    for (var _f = 0, relations_1 = relations; _f < relations_1.length; _f++) {
                        var rel = relations_1[_f];
                        var relationData = this_1.relationMap[rel.propertyName];
                        if (!relationData) {
                            continue;
                        }
                        var col = rel.relationColumns.first(function (o) { return o.propertyName === prop; });
                        var rCol = rel.relationMaps.get(col);
                        for (var _g = 0, _h = relationData.values(); _g < _h.length; _g++) {
                            var relEntry = _h[_g];
                            switch (rel.updateOption) {
                                case "CASCADE": {
                                    relEntry.slaveEntry[rCol.propertyName] = this_1.entity[prop];
                                    break;
                                }
                                case "SET NULL": {
                                    relEntry.slaveEntry[rCol.propertyName] = null;
                                    break;
                                }
                                case "SET DEFAULT": {
                                    relEntry.slaveEntry[rCol.propertyName] = rCol ? ExpressionExecutor_1.ExpressionExecutor.execute(rCol.defaultExp) : null;
                                    break;
                                }
                            }
                        }
                    }
                };
                var this_1 = this;
                for (var _b = 0, _c = acceptedProperties.intersect(this.metaData.primaryKeys.select(function (o) { return o.propertyName; })); _b < _c.length; _b++) {
                    var prop = _c[_b];
                    _loop_1(prop);
                }
                if (this._originalValues.size <= 0) {
                    this.state = EntityState_1.EntityState.Unchanged;
                }
                break;
            }
            case EntityState_1.EntityState.Deleted: {
                this.state = EntityState_1.EntityState.Detached;
                var _loop_2 = function (relMeta) {
                    var relEntities = [];
                    var relProp = this_2.entity[relMeta.propertyName];
                    if (Array.isArray(relProp)) {
                        relEntities = relEntities.concat(this_2.entity[relMeta.propertyName]);
                    }
                    else if (relProp) {
                        relEntities = [relProp];
                    }
                    if (relMeta.reverseRelation.relationType === "one") {
                        relEntities.forEach(function (o) { return o[relMeta.reverseRelation.propertyName] = null; });
                    }
                    else {
                        relEntities.forEach(function (o) { return o[relMeta.reverseRelation.propertyName].delete(_this.entity); });
                    }
                    // apply delete option
                    var relations = this_2.metaData.relations
                        .where(function (o) { return o.isMaster
                        && (o.updateOption === "CASCADE" || o.updateOption === "SET NULL" || o.updateOption === "SET DEFAULT"); });
                    for (var _j = 0, relations_2 = relations; _j < relations_2.length; _j++) {
                        var o = relations_2[_j];
                        var relEntryMap = this_2.relationMap[o.propertyName];
                        if (!relEntryMap) {
                            continue;
                        }
                        for (var _k = 0, _l = relEntryMap.values(); _k < _l.length; _k++) {
                            var relEntry = _l[_k];
                            switch (o.updateOption) {
                                case "CASCADE": {
                                    relEntry.slaveEntry.state = EntityState_1.EntityState.Deleted;
                                    relEntry.slaveEntry.acceptChanges();
                                    break;
                                }
                                case "SET NULL": {
                                    for (var _m = 0, _o = relEntry.slaveRelation.mappedRelationColumns; _m < _o.length; _m++) {
                                        var rCol = _o[_m];
                                        relEntry.slaveEntry[rCol.propertyName] = null;
                                        relEntry.slaveEntry.acceptChanges(rCol.propertyName);
                                    }
                                    break;
                                }
                                case "SET DEFAULT": {
                                    for (var _p = 0, _q = relEntry.slaveRelation.mappedRelationColumns; _p < _q.length; _p++) {
                                        var rCol = _q[_p];
                                        if (rCol.defaultExp) {
                                            relEntry.slaveEntry[rCol.propertyName] = ExpressionExecutor_1.ExpressionExecutor.execute(rCol.defaultExp);
                                            relEntry.slaveEntry.acceptChanges(rCol.propertyName);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                };
                var this_2 = this;
                for (var _d = 0, _e = this.dbSet.metaData.relations; _d < _e.length; _d++) {
                    var relMeta = _e[_d];
                    _loop_2(relMeta);
                }
                break;
            }
            case EntityState_1.EntityState.Added: {
                this.state = EntityState_1.EntityState.Unchanged;
            }
        }
    };
    EntityEntry.prototype.add = function () {
        this.state = this.state === EntityState_1.EntityState.Deleted ? EntityState_1.EntityState.Unchanged : EntityState_1.EntityState.Added;
    };
    EntityEntry.prototype.delete = function () {
        this.state = this.state === EntityState_1.EntityState.Added || this.state === EntityState_1.EntityState.Detached ? EntityState_1.EntityState.Detached : EntityState_1.EntityState.Deleted;
    };
    EntityEntry.prototype.getModifiedProperties = function () {
        return Array.from(this._originalValues.keys());
    };
    EntityEntry.prototype.getOriginalValue = function (prop) {
        if (this._originalValues.has(prop)) {
            return this._originalValues.get(prop);
        }
        return this.entity[prop];
    };
    EntityEntry.prototype.getPrimaryValues = function () {
        var res = {};
        for (var _i = 0, _a = this.dbSet.primaryKeys; _i < _a.length; _i++) {
            var o = _a[_i];
            res[o.propertyName] = this.entity[o.propertyName];
        }
        return res;
    };
    //#region Relations
    EntityEntry.prototype.getRelation = function (propertyName, relatedEntry) {
        var relationMeta = this.metaData.relations.first(function (o) { return o.propertyName === propertyName; });
        var relGroup = this.relationMap[propertyName];
        if (!relGroup) {
            relGroup = new Map();
            this.relationMap[propertyName] = relGroup;
        }
        var relEntry = relGroup.get(relatedEntry);
        if (!relEntry) {
            if (relationMeta.isMaster) {
                relEntry = relatedEntry.getRelation(relationMeta.reverseRelation.propertyName, this);
            }
            else {
                relEntry = new RelationEntry_1.RelationEntry(this, relatedEntry, relationMeta);
            }
            relGroup.set(relatedEntry, relEntry);
        }
        return relEntry;
    };
    EntityEntry.prototype.isPropertyModified = function (prop) {
        return this._originalValues.has(prop);
    };
    /**
     * Load relation to this entity.
     */
    EntityEntry.prototype.loadRelation = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var paramExp, projected;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        paramExp = new ParameterExpression_1.ParameterExpression("o", this.dbSet.type);
                        projected = this.dbSet.primaryKeys.select(function (o) { return new FunctionExpression_1.FunctionExpression(new MemberAccessExpression_1.MemberAccessExpression(paramExp, o.propertyName), [paramExp]); }).toArray();
                        return [4 /*yield*/, (_a = (_b = this.dbSet).project.apply(_b, projected)).include.apply(_a, relations).find(this.getPrimaryValues())];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //#region asd
    /**
     * Reloads the entity from the database overwriting any property values with values from the database.
     * For modified properties, then the original value will be overwrite with vallue from the database.
     * Note: To get clean entity from database, call resetChanges after reload.
     */
    EntityEntry.prototype.reload = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbSet.find(this.getPrimaryValues(), true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //#endregion
    EntityEntry.prototype.buildRelation = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        var relationMetas = this.metaData.relations;
        if (relations.any()) {
            if (typeof relations[0] === "object") {
                relationMetas = relations;
            }
            else {
                relationMetas = relationMetas.where(function (o) { return relations.contains(o.propertyName); }).toArray();
            }
        }
        for (var _a = 0, relationMetas_1 = relationMetas; _a < relationMetas_1.length; _a++) {
            var relMeta = relationMetas_1[_a];
            this.entity[relMeta.propertyName] = this.relatedEntity(relMeta);
        }
    };
    EntityEntry.prototype.relatedEntity = function (relation) {
        if (!relation) {
            return null;
        }
        var set = this.dbSet.dbContext.set(relation.target.type);
        if (!set) {
            return null;
        }
        if (relation.relationType === "many") {
            var enumerable = set.local;
            var _loop_3 = function (col, tCol) {
                var propVal = this_3.entity[col.propertyName];
                if (propVal === undefined) {
                    return { value: undefined };
                }
                enumerable = enumerable.where(function (o) { return o[tCol.propertyName] === propVal; });
            };
            var this_3 = this;
            for (var _i = 0, _a = relation.relationMaps; _i < _a.length; _i++) {
                var _b = _a[_i], col = _b[0], tCol = _b[1];
                var state_1 = _loop_3(col, tCol);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return enumerable.toArray();
        }
        else {
            var key = {};
            for (var _c = 0, _d = relation.relationMaps; _c < _d.length; _c++) {
                var _e = _d[_c], col = _e[0], tCol = _e[1];
                var propVal = this.entity[col.propertyName];
                if (propVal === undefined) {
                    return undefined;
                }
                key[tCol.propertyName] = propVal;
            }
            return set.findLocal(key);
        }
    };
    EntityEntry.prototype.resetChanges = function () {
        var properties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            properties[_i] = arguments[_i];
        }
        if (!properties.any()) {
            properties = Array.from(this._originalValues.keys());
        }
        for (var _a = 0, properties_2 = properties; _a < properties_2.length; _a++) {
            var prop = properties_2[_a];
            if (this._originalValues.has(prop)) {
                this.entity[prop] = this._originalValues.get(prop);
            }
        }
    };
    EntityEntry.prototype.setOriginalValue = function (property, value) {
        if (!(property in this.entity)) {
            return;
        }
        if (this.entity[property] === value) {
            this._originalValues.delete(property);
        }
        else if (this.isPropertyModified(property)) {
            this._originalValues.set(property, value);
        }
        else {
            this.enableTrackChanges = false;
            this.entity[property] = value;
            this.enableTrackChanges = true;
        }
    };
    EntityEntry.prototype.setOriginalValues = function (originalValues) {
        for (var prop in originalValues) {
            var value = originalValues[prop];
            this.setOriginalValue(prop, value);
        }
        this.state = this._originalValues.size > 0 ? EntityState_1.EntityState.Modified : EntityState_1.EntityState.Unchanged;
    };
    EntityEntry.prototype.onRelationChanged = function (param) {
        for (var _i = 0, _a = param.entities; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item === undefined && param.relation.relationType === "one") {
                // undefined means relation may exist or not, so check related entity from context
                item = this.relatedEntity(param.relation);
                if (!item) {
                    continue;
                }
            }
            var entry = this.dbSet.dbContext.entry(item);
            var relationEntry = this.getRelation(param.relation.propertyName, entry);
            if (this.enableTrackChanges) {
                switch (param.type) {
                    case "add": {
                        if (relationEntry.state !== RelationState_1.RelationState.Unchanged) {
                            relationEntry.add();
                        }
                        break;
                    }
                    case "del":
                        if (relationEntry.state !== RelationState_1.RelationState.Detached) {
                            relationEntry.delete();
                        }
                        break;
                }
            }
            else {
                relationEntry.state = RelationState_1.RelationState.Unchanged;
            }
        }
    };
    EntityEntry.prototype.onPropertyChanged = function (param) {
        if (this.dbSet.primaryKeys.contains(param.column)) {
            // primary key changed, update dbset entry dictionary.
            this.dbSet.updateEntryKey(this);
        }
        if (param.oldValue !== param.newValue && param.column instanceof EmbeddedColumnMetaData_1.EmbeddedRelationMetaData) {
            var embeddedDbSet = this.dbSet.dbContext.set(param.column.target.type);
            new EmbeddedEntityEntry_1.EmbeddedEntityEntry(embeddedDbSet, param.newValue, this);
        }
        if (this.enableTrackChanges && (this.state === EntityState_1.EntityState.Modified || this.state === EntityState_1.EntityState.Unchanged) && param.oldValue !== param.newValue) {
            var oriValue = this._originalValues.get(param.column.propertyName);
            if (oriValue === param.newValue) {
                this._originalValues.delete(param.column.propertyName);
                if (this._originalValues.size <= 0) {
                    this.state = EntityState_1.EntityState.Unchanged;
                }
            }
            else if (oriValue === undefined && param.oldValue !== undefined && !param.column.isReadOnly) {
                this._originalValues.set(param.column.propertyName, param.oldValue);
                if (this.state === EntityState_1.EntityState.Unchanged) {
                    this.state = EntityState_1.EntityState.Modified;
                }
            }
        }
    };
    return EntityEntry;
}());
exports.EntityEntry = EntityEntry;
var EmbeddedEntityEntry_1 = require("./EmbeddedEntityEntry");
