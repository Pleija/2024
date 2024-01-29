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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhjZXB0RW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvRXhjZXB0RW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV2RCxNQUFNLE9BQU8sZ0JBQTBCLFNBQVEsVUFBYTtJQUN4RCxZQUErQixNQUFxQixFQUFxQixPQUFzQjtRQUMzRixLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWU7SUFFL0YsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLEtBQUssQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9