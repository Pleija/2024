"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilter = void 0;
function isFilter(whereOrFilter) {
    return whereOrFilter &&
        (whereOrFilter.select !== undefined ||
            whereOrFilter.where !== undefined ||
            whereOrFilter.order !== undefined ||
            whereOrFilter.limit !== undefined ||
            whereOrFilter.offset !== undefined ||
            whereOrFilter.tableAlias !== undefined);
}
exports.isFilter = isFilter;
