import { Enumerable } from "./Enumerable";
export class TakeEnumerable extends Enumerable {
    constructor(parent, takeCount) {
        super();
        this.parent = parent;
        this.takeCount = takeCount;
    }
    *generator() {
        let index = 0;
        for (const value of this.parent) {
            yield value;
            if (++index >= this.takeCount) {
                break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFrZUVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FbnVtZXJhYmxlL1Rha2VFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFMUMsTUFBTSxPQUFPLGNBQXdCLFNBQVEsVUFBYTtJQUN0RCxZQUErQixNQUFxQixFQUFxQixTQUFpQjtRQUN0RixLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLGNBQVMsR0FBVCxTQUFTLENBQVE7SUFFMUYsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixNQUFNLEtBQUssQ0FBQztZQUNaLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM1QixNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==