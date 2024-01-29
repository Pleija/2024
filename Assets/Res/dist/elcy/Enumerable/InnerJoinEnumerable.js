import { Enumerable } from "./Enumerable";
export const defaultResultFn = (item1, item2) => {
    const result = {};
    if (item2) {
        for (const prop in item2) {
            result[prop] = item2[prop];
        }
    }
    if (item1) {
        for (const prop in item1) {
            result[prop] = item1[prop];
        }
    }
    return result;
};
export class InnerJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            for (const value2 of this.parent2) {
                if (this.relation(value1, value2)) {
                    yield this.resultSelector(value1, value2);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5uZXJKb2luRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL0lubmVySm9pbkVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUxQyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBVyxLQUFlLEVBQUUsS0FBZ0IsRUFBSyxFQUFFO0lBQzlFLE1BQU0sTUFBTSxHQUFHLEVBQVMsQ0FBQztJQUN6QixJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUNGLE1BQU0sT0FBTyxtQkFBZ0QsU0FBUSxVQUFhO0lBQzlFLFlBQStCLE1BQXFCLEVBQXFCLE9BQXVCLEVBQXFCLFFBQXlDLEVBQXFCLGlCQUE2QyxlQUFlO1FBQzNPLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBaUM7UUFBcUIsbUJBQWMsR0FBZCxjQUFjLENBQThDO0lBRS9PLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=