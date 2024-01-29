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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hlcmVFbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0VudW1lcmFibGUvV2hlcmVFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFMUMsTUFBTSxPQUFPLGVBQXlCLFNBQVEsVUFBYTtJQUN2RCxZQUErQixNQUFxQixFQUFxQixTQUErQjtRQUNwRyxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLGNBQVMsR0FBVCxTQUFTLENBQXNCO0lBRXhHLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=