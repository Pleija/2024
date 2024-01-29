import { hashCode } from "../Helper/Util";
import { JoinQueryable } from "./JoinQueryable";
export class FullJoinQueryable extends JoinQueryable {
    constructor(parent, parent2, relation, resultSelector, type = Object) {
        super("FULL", parent, parent2, relation, resultSelector, type);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
    }
    hashCode() {
        return hashCode("FULLJOIN", this.parent.hashCode() + this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVsbEpvaW5RdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvRnVsbEpvaW5RdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxNQUFNLE9BQU8saUJBQThDLFNBQVEsYUFBdUI7SUFDdEYsWUFBNEIsTUFBb0IsRUFBcUIsT0FBc0IsRUFBRSxRQUF5RSxFQUFFLGNBQW1GLEVBQVMsT0FBdUIsTUFBYTtRQUNwUyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUR2QyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBeUssU0FBSSxHQUFKLElBQUksQ0FBZ0M7SUFFeFMsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztDQUNKIn0=