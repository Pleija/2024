import { Enumerable } from "./Enumerable";
export class SelectEnumerable extends Enumerable {
    constructor(parent, selector, type) {
        super();
        this.parent = parent;
        this.selector = selector;
        this.type = type;
    }
    *generator() {
        for (const value1 of this.parent) {
            let value = this.selector(value1);
            if (this.type && !(value.constructor instanceof this.type)) {
                value = Object.assign(new this.type(), value);
            }
            yield value;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0RW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvU2VsZWN0RW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxnQkFBbUMsU0FBUSxVQUFhO0lBQ2pFLFlBQStCLE1BQXFCLEVBQXFCLFFBQXdCLEVBQXFCLElBQXFCO1FBQ3ZJLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFBcUIsU0FBSSxHQUFKLElBQUksQ0FBaUI7SUFFM0ksQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDekQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUNELE1BQU0sS0FBSyxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==