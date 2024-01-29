"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityState = void 0;
var EntityState;
(function (EntityState) {
    EntityState[EntityState["Detached"] = 0] = "Detached";
    EntityState[EntityState["Unchanged"] = 1] = "Unchanged";
    EntityState[EntityState["Added"] = 2] = "Added";
    EntityState[EntityState["Deleted"] = 4] = "Deleted";
    EntityState[EntityState["Modified"] = 8] = "Modified";
})(EntityState || (exports.EntityState = EntityState = {}));
