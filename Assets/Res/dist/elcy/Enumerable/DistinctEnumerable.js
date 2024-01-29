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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzdGluY3RFbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0VudW1lcmFibGUvRGlzdGluY3RFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXZELE1BQU0sT0FBTyxrQkFBNEIsU0FBUSxVQUFhO0lBQzFELFlBQStCLE1BQXFCLEVBQXFCLFFBQTJCO1FBQ2hHLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7SUFFcEcsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7UUFDdkIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxLQUFLLENBQUM7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9