import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { EntityExpression } from "../../Queryable/QueryExpression/EntityExpression";
import { InsertIntoExpression } from "../../Queryable/QueryExpression/InsertIntoExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
export class InsertIntoDeferredQuery extends DMLDeferredQuery {
    constructor(queryable, type) {
        super(queryable);
        this.type = type;
    }
    buildQueries(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        const targetSet = this.dbContext.set(this.type);
        const entityExp = new EntityExpression(targetSet.type, visitor.newAlias());
        return [new InsertIntoExpression(entityExp, objectOperand)];
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("INSERTINTO", super.getQueryCacheKey()), hashCode(this.type.name));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zZXJ0SW50b0RlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0luc2VydEludG9EZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFJNUYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLHVCQUEyQixTQUFRLGdCQUFtQjtJQUMvRCxZQUFZLFNBQXVCLEVBQXFCLElBQWlCO1FBQ3JFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQURtQyxTQUFJLEdBQUosSUFBSSxDQUFhO0lBRXpFLENBQUM7SUFDUyxZQUFZLENBQUMsT0FBc0I7UUFDekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBRWhGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0UsT0FBTyxDQUFDLElBQUksb0JBQW9CLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNTLGdCQUFnQjtRQUN0QixPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRyxDQUFDO0NBQ0oifQ==