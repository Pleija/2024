import { hashCode, hashCodeAdd } from "../Helper/Util";
import { JoinQueryable } from "./JoinQueryable";
export class InnerJoinQueryable extends JoinQueryable {
    constructor(parent, parent2, relation, resultSelector, type = Object) {
        super("INNER", parent, parent2, relation, resultSelector, type);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
    }
    hashCode() {
        return hashCodeAdd(hashCode("INNERJOIN", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5uZXJKb2luUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL0lubmVySm9pblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxNQUFNLE9BQU8sa0JBQStDLFNBQVEsYUFBdUI7SUFDdkYsWUFBNEIsTUFBb0IsRUFBcUIsT0FBc0IsRUFBRSxRQUF5RSxFQUFFLGNBQXFFLEVBQVMsT0FBdUIsTUFBYTtRQUN0UixLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUR4QyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBMkosU0FBSSxHQUFKLElBQUksQ0FBZ0M7SUFFMVIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKIn0=