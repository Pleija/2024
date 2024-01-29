import { Enumerable, keyComparer } from "./Enumerable";
export class UnionEnumerable extends Enumerable {
    constructor(parent, parent2, isUnionAll = false) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.isUnionAll = isUnionAll;
    }
    *generator() {
        if (this.isUnionAll) {
            for (const value of this.parent) {
                yield value;
            }
            for (const value of this.parent2) {
                yield value;
            }
        }
        else {
            const result = [];
            for (const value of this.parent) {
                if (!result.any((o) => keyComparer(o, value))) {
                    yield value;
                    result.push(value);
                }
            }
            for (const value of this.parent2) {
                if (!result.any((o) => keyComparer(o, value))) {
                    yield value;
                    result.push(value);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pb25FbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRW51bWVyYWJsZS9VbmlvbkVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdkQsTUFBTSxPQUFPLGVBQXlCLFNBQVEsVUFBYTtJQUN2RCxZQUErQixNQUFxQixFQUFxQixPQUFzQixFQUFrQixhQUFhLEtBQUs7UUFDL0gsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQWtCLGVBQVUsR0FBVixVQUFVLENBQVE7SUFFbkksQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQztZQUNELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixNQUFNLEtBQUssQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQzthQUNJLENBQUM7WUFDRixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7WUFDdkIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsTUFBTSxLQUFLLENBQUM7b0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUM1QyxNQUFNLEtBQUssQ0FBQztvQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==