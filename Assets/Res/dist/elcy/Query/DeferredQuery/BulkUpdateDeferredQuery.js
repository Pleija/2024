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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVsa1VwZGF0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnkvRGVmZXJyZWRRdWVyeS9CdWxrVXBkYXRlRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUUzRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSTFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBRXBGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELDJCQUEyQjtBQUMzQixNQUFNLE9BQU8sdUJBQTJCLFNBQVEsZ0JBQW1CO0lBQy9ELElBQWMsTUFBTTtRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEMsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLFFBQVEsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqSCxDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsU0FBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXNCLEVBQUUsR0FBRyxFQUN2RyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFzQixDQUFDLENBQUM7WUFDOUUsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUNELFlBQVksU0FBdUIsRUFBRSxNQUE0QjtRQUM3RCxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakIsSUFBSSxNQUFNLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQXFDLENBQUM7UUFDekQsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQztJQUlTLFlBQVksQ0FBQyxPQUFzQjtRQUN6QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDL0UsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFDLENBQTZCLENBQUM7UUFDcEksT0FBTyxDQUFDLElBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQ0oifQ==