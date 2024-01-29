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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pb25FbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0VudW1lcmFibGUvVW5pb25FbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXZELE1BQU0sT0FBTyxlQUF5QixTQUFRLFVBQWE7SUFDdkQsWUFBK0IsTUFBcUIsRUFBcUIsT0FBc0IsRUFBa0IsYUFBYSxLQUFLO1FBQy9ILEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFrQixlQUFVLEdBQVYsVUFBVSxDQUFRO0lBRW5JLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7WUFDRCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzVDLE1BQU0sS0FBSyxDQUFDO29CQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7WUFDTCxDQUFDO1lBQ0QsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsTUFBTSxLQUFLLENBQUM7b0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=