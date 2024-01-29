import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class GroupJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            const value2 = [];
            for (const item of this.parent2) {
                if (this.relation(value1, item)) {
                    value2.push(item);
                }
            }
            yield this.resultSelector(value1, value2);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvR3JvdXBKb2luRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RCxNQUFNLE9BQU8sbUJBQWdELFNBQVEsVUFBYTtJQUM5RSxZQUErQixNQUFxQixFQUFxQixPQUF1QixFQUFxQixRQUF5QyxFQUFxQixpQkFBK0MsZUFBZTtRQUM3TyxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQXFCLGFBQVEsR0FBUixRQUFRLENBQWlDO1FBQXFCLG1CQUFjLEdBQWQsY0FBYyxDQUFnRDtJQUVqUCxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9