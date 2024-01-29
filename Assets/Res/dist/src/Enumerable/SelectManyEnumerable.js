import { Enumerable } from "./Enumerable";
export class SelectManyEnumerable extends Enumerable {
    constructor(parent, selector) {
        super();
        this.parent = parent;
        this.selector = selector;
    }
    *generator() {
        for (const value1 of this.parent) {
            const values = this.selector(value1);
            if (values) {
                for (const value of values) {
                    yield value;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0TWFueUVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FbnVtZXJhYmxlL1NlbGVjdE1hbnlFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFMUMsTUFBTSxPQUFPLG9CQUF1QyxTQUFRLFVBQWE7SUFDckUsWUFBK0IsTUFBcUIsRUFBcUIsUUFBNEM7UUFDakgsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixhQUFRLEdBQVIsUUFBUSxDQUFvQztJQUVySCxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUN6QixNQUFNLEtBQUssQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=