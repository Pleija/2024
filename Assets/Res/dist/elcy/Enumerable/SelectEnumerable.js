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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0RW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL1NlbGVjdEVudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUxQyxNQUFNLE9BQU8sZ0JBQW1DLFNBQVEsVUFBYTtJQUNqRSxZQUErQixNQUFxQixFQUFxQixRQUF3QixFQUFxQixJQUFxQjtRQUN2SSxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQXFCLGFBQVEsR0FBUixRQUFRLENBQWdCO1FBQXFCLFNBQUksR0FBSixJQUFJLENBQWlCO0lBRTNJLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxNQUFNLEtBQUssQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=