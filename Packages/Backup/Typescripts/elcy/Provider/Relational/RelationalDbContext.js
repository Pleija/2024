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
exports.RelationalDbContext = void 0;
var DbContext_1 = require("../../Data/DbContext");
var EntityState_1 = require("../../Data/EntityState");
var RelationState_1 = require("../../Data/RelationState");
var Enumerable_1 = require("../../Enumerable/Enumerable");
var Util_1 = require("../../Helper/Util");
var DeleteDeferredQuery_1 = require("../../Query/DeferredQuery/DeleteDeferredQuery");
var InsertDeferredQuery_1 = require("../../Query/DeferredQuery/InsertDeferredQuery");
var RelationAddDeferredQuery_1 = require("../../Query/DeferredQuery/RelationAddDeferredQuery");
var RelationDeleteDeferredQuery_1 = require("../../Query/DeferredQuery/RelationDeleteDeferredQuery");
var UpdateDeferredQuery_1 = require("../../Query/DeferredQuery/UpdateDeferredQuery");
var UpsertDeferredQuery_1 = require("../../Query/DeferredQuery/UpsertDeferredQuery");
var RelationalDbContext = /** @class */ (function (_super) {
    __extends(RelationalDbContext, _super);
    function RelationalDbContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RelationalDbContext.prototype.saveChanges = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var addEntries, updateEntries, deleteEntries, relAddEntries, relDeleteEntries, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addEntries = this.entityEntries.add.asEnumerable().orderBy([function (o) { return o[0].hasIncrementPrimary; }, "DESC"], [function (o) { return o[0].priority; }, "ASC"]);
                        updateEntries = this.entityEntries.update.asEnumerable().orderBy([function (o) { return o[0].priority; }, "ASC"]);
                        deleteEntries = this.entityEntries.delete.asEnumerable().orderBy([function (o) { return o[0].priority; }, "DESC"]);
                        relAddEntries = this.relationEntries.add.asEnumerable().orderBy([function (o) { return o[0].source.priority; }, "ASC"]);
                        relDeleteEntries = this.relationEntries.delete.asEnumerable().orderBy([function (o) { return o[0].source.priority; }, "DESC"]);
                        result = 0;
                        // execute all in transaction;
                        return [4 /*yield*/, this.transaction(function () { return __awaiter(_this, void 0, void 0, function () {
                                var entryMap, relEntryMap, defers, _i, addEntries_1, _a, meta, entries, insertDefers, _b, entries_1, entry, nd, _c, insertDefers_1, defer, relName, relMap, _d, relMap_1, _e, a, b, relId, _f, _g, _h, sCol, mCol, relId, _j, _k, _l, sCol, mCol, _m, updateEntries_1, _o, entries, _p, entries_2, entry, nd, _q, relAddEntries_1, _r, entries, _s, _t, entry, nd, _u, relDeleteEntries_1, _v, entries, filteredEntries, _w, filteredEntries_1, entry, nd, _x, deleteEntries_1, _y, entityMeta, entries, deleteMode, _z, entries_3, entry, nd, _0, defers_1, defer;
                                return __generator(this, function (_1) {
                                    switch (_1.label) {
                                        case 0:
                                            entryMap = new Map();
                                            relEntryMap = new Map();
                                            defers = [];
                                            _i = 0, addEntries_1 = addEntries;
                                            _1.label = 1;
                                        case 1:
                                            if (!(_i < addEntries_1.length)) return [3 /*break*/, 4];
                                            _a = addEntries_1[_i], meta = _a[0], entries = _a[1];
                                            insertDefers = [];
                                            for (_b = 0, entries_1 = entries; _b < entries_1.length; _b++) {
                                                entry = entries_1[_b];
                                                nd = options && options.useUpsert ? this.getUpsertQuery(entry) : this.getInsertQuery(entry);
                                                // Don't finalize result here. coz it will be used later for update/insert related entities
                                                nd.autoFinalize = false;
                                                insertDefers.push(nd);
                                                defers.push(nd);
                                                if (entryMap.has(entry)) {
                                                    nd.relationId = entryMap.get(entry);
                                                    entryMap.delete(entry);
                                                }
                                            }
                                            if (!meta.hasIncrementPrimary) {
                                                return [3 /*break*/, 3];
                                            }
                                            return [4 /*yield*/, this.executeDeferred()];
                                        case 2:
                                            _1.sent();
                                            for (_c = 0, insertDefers_1 = insertDefers; _c < insertDefers_1.length; _c++) {
                                                defer = insertDefers_1[_c];
                                                for (relName in defer.entry.relationMap) {
                                                    relMap = defer.entry.relationMap[relName];
                                                    for (_d = 0, relMap_1 = relMap; _d < relMap_1.length; _d++) {
                                                        _e = relMap_1[_d], a = _e[0], b = _e[1];
                                                        if (a.state === EntityState_1.EntityState.Added) {
                                                            relId = {};
                                                            for (_f = 0, _g = b.slaveRelation.relationMaps; _f < _g.length; _f++) {
                                                                _h = _g[_f], sCol = _h[0], mCol = _h[1];
                                                                if (!(0, Util_1.isNull)(defer.data[mCol.propertyName])) {
                                                                    relId[sCol.propertyName] = defer.data[mCol.propertyName];
                                                                }
                                                            }
                                                            entryMap.set(a, relId);
                                                        }
                                                        else if (b.state === RelationState_1.RelationState.Added) {
                                                            relId = {};
                                                            for (_j = 0, _k = b.slaveRelation.relationMaps; _j < _k.length; _j++) {
                                                                _l = _k[_j], sCol = _l[0], mCol = _l[1];
                                                                if (!(0, Util_1.isNull)(defer.data[mCol.propertyName])) {
                                                                    relId[sCol.propertyName] = defer.data[mCol.propertyName];
                                                                }
                                                            }
                                                            relEntryMap.set(b, relId);
                                                        }
                                                    }
                                                }
                                            }
                                            _1.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4:
                                            for (_m = 0, updateEntries_1 = updateEntries; _m < updateEntries_1.length; _m++) {
                                                _o = updateEntries_1[_m], entries = _o[1];
                                                for (_p = 0, entries_2 = entries; _p < entries_2.length; _p++) {
                                                    entry = entries_2[_p];
                                                    nd = options && options.useUpsert ? this.getUpsertQuery(entry) : this.getUpdateQuery(entry);
                                                    defers.push(nd);
                                                }
                                            }
                                            for (_q = 0, relAddEntries_1 = relAddEntries; _q < relAddEntries_1.length; _q++) {
                                                _r = relAddEntries_1[_q], entries = _r[1];
                                                // Filter out new relation with Added slave entity,
                                                // coz relation has been set at insert query.
                                                for (_s = 0, _t = entries
                                                    .where(function (o) { return !(o.slaveRelation.relationType === "one" && o.slaveEntry.state === EntityState_1.EntityState.Added); }); _s < _t.length; _s++) {
                                                    entry = _t[_s];
                                                    nd = this.getRelationAddQuery(entry);
                                                    defers.push(nd);
                                                }
                                            }
                                            for (_u = 0, relDeleteEntries_1 = relDeleteEntries; _u < relDeleteEntries_1.length; _u++) {
                                                _v = relDeleteEntries_1[_u], entries = _v[1];
                                                filteredEntries = entries
                                                    .where(function (o) { return o.masterEntry.state !== EntityState_1.EntityState.Detached && o.slaveEntry.state !== EntityState_1.EntityState.Detached; })
                                                    .where(function (o) {
                                                    if (o.slaveRelation.completeRelationType !== "many-many") {
                                                        var relGroup = o.slaveEntry.relationMap[o.slaveRelation.propertyName];
                                                        if (relGroup != null) {
                                                            return !Enumerable_1.Enumerable.from(relGroup).any(function (_a) {
                                                                var relEntry = _a[1];
                                                                return relEntry.state === RelationState_1.RelationState.Added;
                                                            });
                                                        }
                                                    }
                                                    return true;
                                                });
                                                for (_w = 0, filteredEntries_1 = filteredEntries; _w < filteredEntries_1.length; _w++) {
                                                    entry = filteredEntries_1[_w];
                                                    nd = this.getRelationDeleteQuery(entry);
                                                    defers.push(nd);
                                                }
                                            }
                                            for (_x = 0, deleteEntries_1 = deleteEntries; _x < deleteEntries_1.length; _x++) {
                                                _y = deleteEntries_1[_x], entityMeta = _y[0], entries = _y[1];
                                                deleteMode = options && options.forceHardDelete || !entityMeta.deletedColumn ? "hard" : "soft";
                                                for (_z = 0, entries_3 = entries; _z < entries_3.length; _z++) {
                                                    entry = entries_3[_z];
                                                    nd = this.getDeleteQuery(entry, deleteMode);
                                                    defers.push(nd);
                                                }
                                            }
                                            return [4 /*yield*/, this.executeDeferred()];
                                        case 5:
                                            _1.sent();
                                            for (_0 = 0, defers_1 = defers; _0 < defers_1.length; _0++) {
                                                defer = defers_1[_0];
                                                defer.finalize();
                                                result += defer.value;
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        // execute all in transaction;
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    RelationalDbContext.prototype.getDeleteQuery = function (entry, deleteMode) {
        return new DeleteDeferredQuery_1.DeleteDeferredQuery(entry, deleteMode);
    };
    RelationalDbContext.prototype.getInsertQuery = function (entry) {
        return new InsertDeferredQuery_1.InsertDeferredQuery(entry);
    };
    RelationalDbContext.prototype.getRelationAddQuery = function (relationEntry) {
        return new RelationAddDeferredQuery_1.RelationAddDeferredQuery(relationEntry);
    };
    RelationalDbContext.prototype.getRelationDeleteQuery = function (relationEntry) {
        return new RelationDeleteDeferredQuery_1.RelationDeleteDeferredQuery(relationEntry);
    };
    RelationalDbContext.prototype.getUpdateQuery = function (entry) {
        return new UpdateDeferredQuery_1.UpdateDeferredQuery(entry);
    };
    RelationalDbContext.prototype.getUpsertQuery = function (entry) {
        return new UpsertDeferredQuery_1.UpsertDeferredQuery(entry);
    };
    return RelationalDbContext;
}(DbContext_1.DbContext));
exports.RelationalDbContext = RelationalDbContext;
