import { CrossJoinEnumerable } from "./CrossJoinEnumerable";
import { DistinctEnumerable } from "./DistinctEnumerable";
import { Enumerable } from "./Enumerable";
import { ExceptEnumerable } from "./ExceptEnumerable";
import { FullJoinEnumerable } from "./FullJoinEnumerable";
import { GroupByEnumerable } from "./GroupByEnumerable";
import { GroupJoinEnumerable } from "./GroupJoinEnumerable";
import { defaultResultFn, InnerJoinEnumerable } from "./InnerJoinEnumerable";
import { IntersectEnumerable } from "./IntersectEnumerable";
import { LeftJoinEnumerable } from "./LeftJoinEnumerable";
import { OrderEnumerable } from "./OrderEnumerable";
import { RightJoinEnumerable } from "./RightJoinEnumerable";
import { SelectEnumerable } from "./SelectEnumerable";
import { SelectManyEnumerable } from "./SelectManyEnumerable";
import { SkipEnumerable } from "./SkipEnumerable";
import { TakeEnumerable } from "./TakeEnumerable";
import { UnionEnumerable } from "./UnionEnumerable";
import { WhereEnumerable } from "./WhereEnumerable";
Enumerable.prototype.cast = function () {
    return this;
};
Enumerable.prototype.select = function (typeOrSelector, selector) {
    let type;
    if (!selector) {
        selector = typeOrSelector;
    }
    else {
        type = typeOrSelector;
    }
    return new SelectEnumerable(this, selector, type);
};
Enumerable.prototype.selectMany = function (selector) {
    return new SelectManyEnumerable(this, selector);
};
Enumerable.prototype.where = function (predicate) {
    return new WhereEnumerable(this, predicate);
};
Enumerable.prototype.orderBy = function (...selectors) {
    return new OrderEnumerable(this, ...selectors);
};
Enumerable.prototype.skip = function (skip) {
    return new SkipEnumerable(this, skip);
};
Enumerable.prototype.take = function (take) {
    return new TakeEnumerable(this, take);
};
Enumerable.prototype.groupBy = function (keySelector) {
    return new GroupByEnumerable(this, keySelector);
};
Enumerable.prototype.distinct = function (selector) {
    return new DistinctEnumerable(this, selector);
};
Enumerable.prototype.innerJoin = function (array2, relation, resultSelector = defaultResultFn) {
    return new InnerJoinEnumerable(this, Enumerable.from(array2), relation, resultSelector);
};
Enumerable.prototype.leftJoin = function (array2, relation, resultSelector = defaultResultFn) {
    return new LeftJoinEnumerable(this, Enumerable.from(array2), relation, resultSelector);
};
Enumerable.prototype.rightJoin = function (array2, relation, resultSelector = defaultResultFn) {
    return new RightJoinEnumerable(this, Enumerable.from(array2), relation, resultSelector);
};
Enumerable.prototype.fullJoin = function (array2, relation, resultSelector = defaultResultFn) {
    return new FullJoinEnumerable(this, Enumerable.from(array2), relation, resultSelector);
};
Enumerable.prototype.groupJoin = function (array2, relation, resultSelector = defaultResultFn) {
    return new GroupJoinEnumerable(this, Enumerable.from(array2), relation, resultSelector);
};
Enumerable.prototype.crossJoin = function (array2, resultSelector = defaultResultFn) {
    return new CrossJoinEnumerable(this, Enumerable.from(array2), resultSelector);
};
Enumerable.prototype.union = function (array2, isUnionAll = false) {
    return new UnionEnumerable(this, Enumerable.from(array2), isUnionAll);
};
Enumerable.prototype.intersect = function (array2) {
    return new IntersectEnumerable(this, Enumerable.from(array2));
};
Enumerable.prototype.except = function (array2) {
    return new ExceptEnumerable(this, Enumerable.from(array2));
};
Enumerable.prototype.pivot = function (dimensions, metrics) {
    return new SelectEnumerable(new GroupByEnumerable(this, (o) => {
        const dimensionKey = {};
        for (const key in dimensions) {
            if (dimensions[key] instanceof Function) {
                dimensionKey[key] = dimensions[key](o);
            }
        }
        return dimensionKey;
    }), (o) => {
        for (const key in metrics) {
            if (o.key) {
                o.key[key] = metrics[key](o.toArray());
            }
        }
        return o.key;
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bWVyYWJsZS5wYXJ0aWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRW51bWVyYWJsZS9FbnVtZXJhYmxlLnBhcnRpYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFN0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQTBCcEQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUc7SUFDeEIsT0FBTyxJQUFXLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBQ0YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBMkMsY0FBNkQsRUFBRSxRQUFpQztJQUNySyxJQUFJLElBQTBCLENBQUM7SUFDL0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ1osUUFBUSxHQUFHLGNBQXFCLENBQUM7SUFDckMsQ0FBQztTQUNJLENBQUM7UUFDRixJQUFJLEdBQUcsY0FBcUIsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFDO0FBQ0YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBMkMsUUFBc0Q7SUFDL0gsT0FBTyxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNwRCxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFrQyxTQUErQjtJQUMxRixPQUFPLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFrQyxHQUFHLFNBQXFDO0lBQ3JHLE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDbkQsQ0FBQyxDQUFDO0FBQ0YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBa0MsSUFBWTtJQUN0RSxPQUFPLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFrQyxJQUFZO0lBQ3RFLE9BQU8sSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQztBQUNGLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQXFDLFdBQTJCO0lBQzNGLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDcEQsQ0FBQyxDQUFDO0FBQ0YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBa0MsUUFBMkI7SUFDekYsT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUErQyxNQUF1QixFQUFFLFFBQXlDLEVBQUUsaUJBQW1ELGVBQWU7SUFDbE4sT0FBTyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM1RixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUErQyxNQUF1QixFQUFFLFFBQXlDLEVBQUUsaUJBQTBELGVBQWU7SUFDeE4sT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzRixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUErQyxNQUF1QixFQUFFLFFBQXlDLEVBQUUsaUJBQTBELGVBQWU7SUFDek4sT0FBTyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM1RixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUErQyxNQUF1QixFQUFFLFFBQXlDLEVBQUUsaUJBQWlFLGVBQWU7SUFDL04sT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzRixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUErQyxNQUF1QixFQUFFLFFBQXlDLEVBQUUsaUJBQXFELGVBQWU7SUFDcE4sT0FBTyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM1RixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUErQyxNQUF1QixFQUFFLGlCQUFpRSxlQUFlO0lBQ3JMLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNsRixDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFrQyxNQUFzQixFQUFFLGFBQXNCLEtBQUs7SUFDOUcsT0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFrQyxNQUFzQjtJQUNyRixPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRSxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFrQyxNQUFzQjtJQUNsRixPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMvRCxDQUFDLENBQUM7QUFDRixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFnSixVQUFjLEVBQUUsT0FBVztJQUNwTSxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUMxRCxNQUFNLFlBQVksR0FBRyxFQUFzQixDQUFDO1FBQzVDLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDM0IsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksUUFBUSxFQUFFLENBQUM7Z0JBQ3RDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUErQixDQUFDO1lBQ3pFLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNOLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUErQixDQUFDO1lBQ3pFLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDIn0=