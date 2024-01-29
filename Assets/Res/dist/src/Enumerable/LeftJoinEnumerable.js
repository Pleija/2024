import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class LeftJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            let hasMatch = false;
            for (const value2 of this.parent2) {
                if (this.relation(value1, value2)) {
                    hasMatch = true;
                    yield this.resultSelector(value1, value2);
                }
            }
            if (!hasMatch) {
                yield this.resultSelector(value1, null);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVmdEpvaW5FbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRW51bWVyYWJsZS9MZWZ0Sm9pbkVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFeEQsTUFBTSxPQUFPLGtCQUErQyxTQUFRLFVBQWE7SUFDN0UsWUFBK0IsTUFBcUIsRUFBcUIsT0FBdUIsRUFBcUIsUUFBeUMsRUFBcUIsaUJBQW9ELGVBQWU7UUFDbFAsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFxQixhQUFRLEdBQVIsUUFBUSxDQUFpQztRQUFxQixtQkFBYyxHQUFkLGNBQWMsQ0FBcUQ7SUFFdFAsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUMsQ0FBQztZQUNMLENBQUM7WUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ1osTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9