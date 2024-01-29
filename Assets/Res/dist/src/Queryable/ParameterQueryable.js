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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1ldGVyUXVlcnlhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL1BhcmFtZXRlclF1ZXJ5YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXZELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHeEMsTUFBTSxPQUFPLGtCQUFzQixTQUFRLFNBQVk7SUFDbkQsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ0QsWUFBWSxNQUFvQixFQUFFLE1BQThCO1FBQzVELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBUXZCLHVCQUFrQixHQUFHLENBQUMsQ0FBQztRQVAzQixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNuQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztTQUNwRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBR00sVUFBVSxDQUFDLE9BQXNCO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDcEMsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDTSxTQUFTLENBQUMsTUFBOEI7UUFDM0MsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUN4QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxLQUFLLFlBQVksU0FBUyxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEQsQ0FBQztpQkFDSSxJQUFJLEtBQUssWUFBWSxRQUFRLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMxRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSiJ9