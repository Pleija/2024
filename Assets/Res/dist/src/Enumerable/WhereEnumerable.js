import { Enumerable } from "./Enumerable";
export class WhereEnumerable extends Enumerable {
    constructor(parent, predicate) {
        super();
        this.parent = parent;
        this.predicate = predicate;
    }
    *generator() {
        for (const value of this.parent) {
            if (this.predicate(value)) {
                yield value;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hlcmVFbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRW51bWVyYWJsZS9XaGVyZUVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUxQyxNQUFNLE9BQU8sZUFBeUIsU0FBUSxVQUFhO0lBQ3ZELFlBQStCLE1BQXFCLEVBQXFCLFNBQStCO1FBQ3BHLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsY0FBUyxHQUFULFNBQVMsQ0FBc0I7SUFFeEcsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==