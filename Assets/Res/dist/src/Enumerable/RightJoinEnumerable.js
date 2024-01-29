import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class RightJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        const array2 = this.parent2.toArray();
        for (const value1 of this.parent) {
            for (const value2 of this.parent2) {
                if (this.relation(value1, value2)) {
                    yield this.resultSelector(value1, value2);
                    array2.delete(value2);
                }
            }
        }
        for (const value2 of array2) {
            yield this.resultSelector(null, value2);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmlnaHRKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvUmlnaHRKb2luRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RCxNQUFNLE9BQU8sbUJBQWdELFNBQVEsVUFBYTtJQUM5RSxZQUErQixNQUFxQixFQUFxQixPQUF1QixFQUFxQixRQUF5QyxFQUFxQixpQkFBb0QsZUFBZTtRQUNsUCxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQXFCLGFBQVEsR0FBUixRQUFRLENBQWlDO1FBQXFCLG1CQUFjLEdBQWQsY0FBYyxDQUFxRDtJQUV0UCxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMxQixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==