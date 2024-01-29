import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class CrossJoinEnumerable extends Enumerable {
    constructor(parent, parent2, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            for (const value2 of this.parent2) {
                yield this.resultSelector(value1, value2);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3Jvc3NKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL0Nyb3NzSm9pbkVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFeEQsTUFBTSxPQUFPLG1CQUFnRCxTQUFRLFVBQWE7SUFDOUUsWUFBK0IsTUFBcUIsRUFBcUIsT0FBdUIsRUFBcUIsaUJBQTJELGVBQWU7UUFDM0wsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFxQixtQkFBYyxHQUFkLGNBQWMsQ0FBNEQ7SUFFL0wsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9