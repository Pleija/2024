import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { toObjectFunctionExpression } from "../../Helper/ExpressionUtil";
import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { UpdateExpression } from "../../Queryable/QueryExpression/UpdateExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
// TODO: consider parameter
export class BulkUpdateDeferredQuery extends DMLDeferredQuery {
    get setter() {
        if (!this._setter && this._setterFn) {
            if (this._setterFn instanceof Function) {
                this._setter = ExpressionBuilder.parse(this._setterFn, [this.queryable.type], this.queryable.stackTree.node);
            }
            else {
                this._setter = toObjectFunctionExpression(this._setterFn, this.queryable.type, "o", this.queryable.stackTree.node, this.queryable.type);
            }
        }
        return this._setter;
    }
    constructor(queryable, setter) {
        super(queryable);
        if (setter instanceof FunctionExpression) {
            this._setter = setter;
        }
        else {
            this._setterFn = setter;
        }
    }
    buildQueries(visitor) {
        const commandQuery = this.queryable.buildQuery(visitor);
        const obj = visitor.visitFunction(this.setter, [commandQuery.entity], { selectExpression: commandQuery });
        return [new UpdateExpression(commandQuery, obj.object)];
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("UPDATE", super.getQueryCacheKey()), this.setter.hashCode());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVsa1VwZGF0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0J1bGtVcGRhdGVEZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBRTNGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFFcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsMkJBQTJCO0FBQzNCLE1BQU0sT0FBTyx1QkFBMkIsU0FBUSxnQkFBbUI7SUFDL0QsSUFBYyxNQUFNO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsQyxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksUUFBUSxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pILENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMsT0FBTyxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFnQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBc0IsRUFBRSxHQUFHLEVBQ3ZHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXNCLENBQUMsQ0FBQztZQUM5RSxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBQ0QsWUFBWSxTQUF1QixFQUFFLE1BQTRCO1FBQzdELEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQixJQUFJLE1BQU0sWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBcUMsQ0FBQztRQUN6RCxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO1FBQzVCLENBQUM7SUFDTCxDQUFDO0lBSVMsWUFBWSxDQUFDLE9BQXNCO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUMvRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUMsQ0FBNkIsQ0FBQztRQUNwSSxPQUFPLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUNTLGdCQUFnQjtRQUN0QixPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDSiJ9