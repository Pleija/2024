import { Enumerable, keyComparer } from "./Enumerable";
export class DistinctEnumerable extends Enumerable {
    constructor(parent, selector) {
        super();
        this.parent = parent;
        this.selector = selector;
    }
    *generator() {
        const result = [];
        for (const value of this.parent) {
            const key = this.selector ? this.selector(value) : value;
            if (!result.any((o) => keyComparer(key, o))) {
                yield value;
                result.push(value);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzdGluY3RFbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRW51bWVyYWJsZS9EaXN0aW5jdEVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdkQsTUFBTSxPQUFPLGtCQUE0QixTQUFRLFVBQWE7SUFDMUQsWUFBK0IsTUFBcUIsRUFBcUIsUUFBMkI7UUFDaEcsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixhQUFRLEdBQVIsUUFBUSxDQUFtQjtJQUVwRyxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLEtBQUssQ0FBQztnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=