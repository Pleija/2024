import { hashCode, hashCodeAdd } from "../Helper/Util";
import { JoinQueryable } from "./JoinQueryable";
export class LeftJoinQueryable extends JoinQueryable {
    constructor(parent, parent2, relation, resultSelector, type = Object) {
        super("LEFT", parent, parent2, relation, resultSelector, type);
        this.parent = parent;
        this.parent2 = parent2;
        this.type = type;
    }
    hashCode() {
        return hashCodeAdd(hashCode("LEFTJOIN", this.parent.hashCode()), this.parent2.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVmdEpvaW5RdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL0xlZnRKb2luUXVlcnlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR2hELE1BQU0sT0FBTyxpQkFBOEMsU0FBUSxhQUF1QjtJQUN0RixZQUE0QixNQUFvQixFQUFxQixPQUFzQixFQUFFLFFBQXlFLEVBQUUsY0FBNEUsRUFBUyxPQUF1QixNQUFhO1FBQzdSLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRHZDLFdBQU0sR0FBTixNQUFNLENBQWM7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFrSyxTQUFJLEdBQUosSUFBSSxDQUFnQztJQUVqUyxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5RixDQUFDO0NBQ0oifQ==