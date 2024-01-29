import { hashCode, hashCodeAdd } from "../Helper/Util";
import { JoinQueryable } from "./JoinQueryable";
export class RightJoinQueryable extends JoinQueryable {
    constructor(parent, parent2, relation, resultSelector, type = Object) {
        super("RIGHT", parent, parent2, relation, resultSelector, type);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
    }
    hashCode() {
        return hashCodeAdd(hashCode("RIGHTJOIN", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmlnaHRKb2luUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1JpZ2h0Sm9pblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxNQUFNLE9BQU8sa0JBQStDLFNBQVEsYUFBdUI7SUFDdkYsWUFBNEIsTUFBb0IsRUFBcUIsT0FBc0IsRUFBRSxRQUF5RSxFQUFFLGNBQTRFLEVBQVMsT0FBdUIsTUFBYTtRQUM3UixLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUR4QyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBa0ssU0FBSSxHQUFKLElBQUksQ0FBZ0M7SUFFalMsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKIn0=