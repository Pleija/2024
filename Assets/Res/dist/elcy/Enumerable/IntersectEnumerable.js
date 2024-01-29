import { Enumerable } from "./Enumerable";
import { keyComparer } from "./Enumerable";
export class IntersectEnumerable extends Enumerable {
    constructor(parent, parent2) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
    }
    *generator() {
        for (const value of this.parent) {
            for (const value2 of this.parent2) {
                if (keyComparer(value, value2)) {
                    yield value;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJzZWN0RW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL0ludGVyc2VjdEVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTNDLE1BQU0sT0FBTyxtQkFBNkIsU0FBUSxVQUFhO0lBQzNELFlBQStCLE1BQXFCLEVBQXFCLE9BQXNCO1FBQzNGLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtJQUUvRixDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxLQUFLLENBQUM7Z0JBQ2hCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9