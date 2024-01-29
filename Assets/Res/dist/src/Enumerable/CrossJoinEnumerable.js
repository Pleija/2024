import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class CrossJoinEnumerable extends Enumerable {
    constructor(parent, parent2, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            for (const value2 of this.parent2) {
                yield this.resultSelector(value1, value2);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3Jvc3NKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvQ3Jvc3NKb2luRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RCxNQUFNLE9BQU8sbUJBQWdELFNBQVEsVUFBYTtJQUM5RSxZQUErQixNQUFxQixFQUFxQixPQUF1QixFQUFxQixpQkFBMkQsZUFBZTtRQUMzTCxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQXFCLG1CQUFjLEdBQWQsY0FBYyxDQUE0RDtJQUUvTCxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9CLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=