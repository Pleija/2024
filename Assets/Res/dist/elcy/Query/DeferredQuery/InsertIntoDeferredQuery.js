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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zZXJ0SW50b0RlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnkvRGVmZXJyZWRRdWVyeS9JbnNlcnRJbnRvRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBSTVGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyx1QkFBMkIsU0FBUSxnQkFBbUI7SUFDL0QsWUFBWSxTQUF1QixFQUFxQixJQUFpQjtRQUNyRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFEbUMsU0FBSSxHQUFKLElBQUksQ0FBYTtJQUV6RSxDQUFDO0lBQ1MsWUFBWSxDQUFDLE9BQXNCO1FBQ3pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBd0IsQ0FBQztRQUVoRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLE9BQU8sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztDQUNKIn0=