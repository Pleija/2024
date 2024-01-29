import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class RightJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        const array2 = this.parent2.toArray();
        for (const value1 of this.parent) {
            for (const value2 of this.parent2) {
                if (this.relation(value1, value2)) {
                    yield this.resultSelector(value1, value2);
                    array2.delete(value2);
                }
            }
        }
        for (const value2 of array2) {
            yield this.resultSelector(null, value2);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmlnaHRKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL1JpZ2h0Sm9pbkVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFeEQsTUFBTSxPQUFPLG1CQUFnRCxTQUFRLFVBQWE7SUFDOUUsWUFBK0IsTUFBcUIsRUFBcUIsT0FBdUIsRUFBcUIsUUFBeUMsRUFBcUIsaUJBQW9ELGVBQWU7UUFDbFAsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFxQixhQUFRLEdBQVIsUUFBUSxDQUFpQztRQUFxQixtQkFBYyxHQUFkLGNBQWMsQ0FBcUQ7SUFFdFAsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9CLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ2hDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxFQUFFLENBQUM7WUFDMUIsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=