import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DeleteExpression } from "../../Queryable/QueryExpression/DeleteExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
// TODO: currently cache only work when query has same delete mode.
export class BulkDeleteDeferredQuery extends DMLDeferredQuery {
    constructor(queryable, mode) {
        super(queryable);
        this.mode = mode;
    }
    buildQueries(visitor) {
        const objectOperand = this.queryable.buildQuery(visitor);
        return [new DeleteExpression(objectOperand, this.mode)];
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("DELETE", super.getQueryCacheKey()), hashCode(this.mode));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVsa0RlbGV0ZURlZmVycmVkUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnkvRGVmZXJyZWRRdWVyeS9CdWxrRGVsZXRlRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBSXBGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELG1FQUFtRTtBQUNuRSxNQUFNLE9BQU8sdUJBQTJCLFNBQVEsZ0JBQW1CO0lBQy9ELFlBQVksU0FBdUIsRUFBcUIsSUFBZ0I7UUFDcEUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRG1DLFNBQUksR0FBSixJQUFJLENBQVk7SUFFeEUsQ0FBQztJQUNTLFlBQVksQ0FBQyxPQUFzQjtRQUN6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQXdCLENBQUM7UUFDaEYsT0FBTyxDQUFDLElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFDUyxnQkFBZ0I7UUFDdEIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0oifQ==