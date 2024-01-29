import { clone } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class OptionQueryable extends Queryable {
    get queryOption() {
        return this._queryOption;
    }
    constructor(parent, option) {
        super(parent.type, parent);
        this._queryOption = clone(this.parent.queryOption);
        this.option(option);
    }
    buildQuery(queryVisitor) {
        return this.parent.buildQuery(queryVisitor);
    }
    hashCode() {
        return this.parent.hashCode();
    }
    option(option) {
        for (const prop in option) {
            const value = option[prop];
            if (value instanceof Object) {
                if (!this.queryOption[prop]) {
                    this.queryOption[prop] = {};
                }
                Object.assign(this.queryOption[prop], value);
            }
            else {
                this.queryOption[prop] = value;
            }
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL09wdGlvblF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUd4QyxNQUFNLE9BQU8sZUFBbUIsU0FBUSxTQUFZO0lBQ2hELElBQVcsV0FBVztRQUNsQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUNELFlBQVksTUFBb0IsRUFBRSxNQUFvQjtRQUNsRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxZQUEyQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFDTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUN4QixNQUFNLEtBQUssR0FBSSxNQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxLQUFLLFlBQVksTUFBTSxFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsV0FBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsV0FBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxRCxDQUFDO2lCQUNJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFdBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzVDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=