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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlhYmxlLnBhcnRpYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL1F1ZXJ5YWJsZS5wYXJ0aWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFMUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixF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