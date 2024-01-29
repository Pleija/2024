import { Queryable } from "../Queryable/Queryable";
import { CrossJoinQueryable } from "./CrossJoinQueryable";
import { DistinctQueryable } from "./DistinctQueryable";
import { ExceptQueryable } from "./ExceptQueryable";
import { FullJoinQueryable } from "./FullJoinQueryable";
import { GroupByQueryable } from "./GroupByQueryable";
import { GroupJoinQueryable } from "./GroupJoinQueryable";
import { IncludeQueryable } from "./IncludeQueryable";
import { InnerJoinQueryable } from "./InnerJoinQueryable";
import { IntersectQueryable } from "./IntersectQueryable";
import { LeftJoinQueryable } from "./LeftJoinQueryable";
import { OptionQueryable } from "./OptionQueryable";
import { OrderQueryable } from "./OrderQueryable";
import { ParameterQueryable } from "./ParameterQueryable";
import { PivotQueryable } from "./PivotQueryable";
import { ProjectQueryable } from "./ProjectQueryable";
import { RightJoinQueryable } from "./RightJoinQueryable";
import { SelectManyQueryable } from "./SelectManyQueryable";
import { SelectQueryable } from "./SelectQueryable";
import { SkipQueryable } from "./SkipQueryable";
import { TakeQueryable } from "./TakeQueryable";
import { UnionQueryable } from "./UnionQueryable";
import { WhereQueryable } from "./WhereQueryable";
Queryable.prototype.select = function (typeOrSelector, selector) {
    let type;
    if (!selector) {
        selector = typeOrSelector;
    }
    else {
        type = typeOrSelector;
    }
    return new SelectQueryable(this, selector, type);
};
Queryable.prototype.parameter = function (params) {
    return new ParameterQueryable(this, params);
};
Queryable.prototype.option = function (option) {
    return new OptionQueryable(this, option);
};
Queryable.prototype.selectMany = function (selector, type) {
    return new SelectManyQueryable(this, selector, type);
};
Queryable.prototype.where = function (predicate) {
    return new WhereQueryable(this, predicate);
};
Queryable.prototype.orderBy = function (...selectors) {
    return new OrderQueryable(this, ...selectors);
};
Queryable.prototype.skip = function (skip) {
    return new SkipQueryable(this, skip);
};
Queryable.prototype.take = function (take) {
    return new TakeQueryable(this, take);
};
Queryable.prototype.groupBy = function (keySelector) {
    return new GroupByQueryable(this, keySelector);
};
Queryable.prototype.distinct = function () {
    return new DistinctQueryable(this);
};
Queryable.prototype.groupJoin = function (array2, relation, resultSelector) {
    return new GroupJoinQueryable(this, array2, relation, resultSelector);
};
Queryable.prototype.innerJoin = function (array2, relation, resultSelector) {
    return new InnerJoinQueryable(this, array2, relation, resultSelector);
};
Queryable.prototype.leftJoin = function (array2, relation, resultSelector) {
    return new LeftJoinQueryable(this, array2, relation, resultSelector);
};
Queryable.prototype.rightJoin = function (array2, relation, resultSelector) {
    return new RightJoinQueryable(this, array2, relation, resultSelector);
};
Queryable.prototype.fullJoin = function (array2, relation, resultSelector) {
    return new FullJoinQueryable(this, array2, relation, resultSelector);
};
Queryable.prototype.crossJoin = function (array2, resultSelector) {
    return new CrossJoinQueryable(this, array2, resultSelector);
};
Queryable.prototype.union = function (array2, isUnionAll = false) {
    return new UnionQueryable(this, array2, isUnionAll);
};
Queryable.prototype.intersect = function (array2) {
    return new IntersectQueryable(this, array2);
};
Queryable.prototype.except = function (array2) {
    return new ExceptQueryable(this, array2);
};
Queryable.prototype.pivot = function (dimensions, metrics) {
    return new PivotQueryable(this, dimensions, metrics);
};
Queryable.prototype.include = function (...includes) {
    return new IncludeQueryable(this, includes);
};
Queryable.prototype.project = function (...includes) {
    return new ProjectQueryable(this, includes);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlhYmxlLnBhcnRpYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUXVlcnlhYmxlLnBhcnRpYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUUxRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVB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