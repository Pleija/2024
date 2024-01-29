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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVsbEpvaW5RdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL0Z1bGxKb2luUXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHaEQsTUFBTSxPQUFPLGlCQUE4QyxTQUFRLGFBQXVCO0lBQ3RGLFlBQTRCLE1BQW9CLEVBQXFCLE9BQXNCLEVBQUUsUUFBeUUsRUFBRSxjQUFtRixFQUFTLE9BQXVCLE1BQWE7UUFDcFMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEdkMsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQXlLLFNBQUksR0FBSixJQUFJLENBQWdDO0lBRXhTLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSiJ9