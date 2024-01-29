import { Enumerable, keyComparer } from "./Enumerable";
export class ExceptEnumerable extends Enumerable {
    constructor(parent, parent2) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
    }
    *generator() {
        for (const value of this.parent) {
            if (!this.parent2.any((o) => keyComparer(o, value))) {
                yield value;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhjZXB0RW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL0V4Y2VwdEVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdkQsTUFBTSxPQUFPLGdCQUEwQixTQUFRLFVBQWE7SUFDeEQsWUFBK0IsTUFBcUIsRUFBcUIsT0FBc0I7UUFDM0YsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFlO0lBRS9GLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==