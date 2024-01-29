import { hashCode, hashCodeAdd } from "../Helper/Util";
import { JoinQueryable } from "./JoinQueryable";
export class CrossJoinQueryable extends JoinQueryable {
    constructor(parent, parent2, resultSelector, type = Object) {
        super("CROSS", parent, parent2, null, resultSelector, type);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
    }
    hashCode() {
        return hashCodeAdd(hashCode("CROSSJOIN", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3Jvc3NKb2luUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL0Nyb3NzSm9pblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxNQUFNLE9BQU8sa0JBQStDLFNBQVEsYUFBdUI7SUFDdkYsWUFBNEIsTUFBb0IsRUFBcUIsT0FBc0IsRUFBRSxjQUE0RSxFQUFTLE9BQXVCLE1BQWE7UUFDbE4sS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFEcEMsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUFxQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQXVGLFNBQUksR0FBSixJQUFJLENBQWdDO0lBRXROLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FDSiJ9