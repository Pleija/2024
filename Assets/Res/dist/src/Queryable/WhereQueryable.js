import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class WhereQueryable extends Queryable {
    get predicate() {
        if (!this._predicate && this.predicateFn) {
            this._predicate = ExpressionBuilder.parse(this.predicateFn, [this.parent.type], this.stackTree.node);
        }
        return this._predicate;
    }
    set predicate(value) {
        this._predicate = value;
    }
    constructor(parent, predicate) {
        super(parent.type, parent);
        this.parent = parent;
        if (predicate instanceof FunctionExpression) {
            this.predicate = predicate;
        }
        else {
            this.predicateFn = predicate;
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "where", [this.predicate.clone()]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        return hashCodeAdd(hashCode("WHERE", this.parent.hashCode()), this.predicate.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hlcmVRdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvV2hlcmVRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDeEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBTyxjQUFrQixTQUFRLFNBQVk7SUFDL0MsSUFBYyxTQUFTO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQWMsU0FBUyxDQUFDLEtBQUs7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNELFlBQTRCLE1BQW9CLEVBQUUsU0FBK0I7UUFDN0UsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFESCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBRTVDLElBQUksU0FBUyxZQUFZLGtCQUFrQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDL0IsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQUdNLFVBQVUsQ0FBQyxPQUFzQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRyxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ2pHLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQVEsQ0FBQztJQUM5RCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQ0oifQ==