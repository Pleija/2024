import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class ParameterQueryable extends Queryable {
    get stackTree() {
        return this._param;
    }
    constructor(parent, params) {
        super(parent.type, parent);
        this._parameterHashCode = 0;
        this._param = {
            node: parent.stackTree.node.clone(),
            childrens: Array.from(parent.stackTree.childrens)
        };
        this.parameter(params);
    }
    buildQuery(visitor) {
        const command = this.parent.buildQuery(visitor);
        visitor.stack = this.stackTree.node;
        return command;
    }
    hashCode() {
        return hashCodeAdd(this._parameterHashCode, this.parent.hashCode());
    }
    parameter(params) {
        for (const prop in params) {
            const value = params[prop];
            if (value instanceof Queryable) {
                this._parameterHashCode += value.hashCode();
            }
            else if (value instanceof Function) {
                this._parameterHashCode += hashCode(value.toString());
            }
            this._param.node.push(prop, value);
        }
        this._param.node.set(params);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1ldGVyUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9QYXJhbWV0ZXJRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR3hDLE1BQU0sT0FBTyxrQkFBc0IsU0FBUSxTQUFZO0lBQ25ELElBQVcsU0FBUztRQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELFlBQVksTUFBb0IsRUFBRSxNQUE4QjtRQUM1RCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQVF2Qix1QkFBa0IsR0FBRyxDQUFDLENBQUM7UUFQM0IsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNWLElBQUksRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbkMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7U0FDcEQsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3BDLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBQ00sU0FBUyxDQUFDLE1BQThCO1FBQzNDLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7WUFDeEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksS0FBSyxZQUFZLFNBQVMsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsa0JBQWtCLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hELENBQUM7aUJBQ0ksSUFBSSxLQUFLLFlBQVksUUFBUSxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0oifQ==