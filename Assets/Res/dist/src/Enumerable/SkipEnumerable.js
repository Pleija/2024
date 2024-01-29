import { Enumerable } from "./Enumerable";
export class SkipEnumerable extends Enumerable {
    constructor(parent, skipCount) {
        super();
        this.parent = parent;
        this.skipCount = skipCount;
    }
    *generator() {
        let index = 0;
        for (const value of this.parent) {
            if (index++ < this.skipCount) {
                continue;
            }
            yield value;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2tpcEVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FbnVtZXJhYmxlL1NraXBFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFMUMsTUFBTSxPQUFPLGNBQXdCLFNBQVEsVUFBYTtJQUN0RCxZQUErQixNQUFxQixFQUFxQixTQUFpQjtRQUN0RixLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLGNBQVMsR0FBVCxTQUFTLENBQVE7SUFFMUYsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDM0IsU0FBUztZQUNiLENBQUM7WUFDRCxNQUFNLEtBQUssQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=