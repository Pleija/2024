import { EntityEntry } from "../../Data/EntityEntry";
import { MemberAccessExpression } from "../../ExpressionBuilder/Expression/MemberAccessExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DeleteExpression } from "../../Queryable/QueryExpression/DeleteExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
export class DeleteDeferredQuery extends DMLDeferredQuery {
    constructor(entry, mode, autoFinalize = true) {
        super(entry.dbSet.parameter({ entry: entry }));
        this.entry = entry;
        this.mode = mode;
        this.autoFinalize = autoFinalize;
        if (this.queryOption.beforeDelete) {
            this.queryOption.beforeDelete(this.entry.entity, { mode: this.mode });
        }
        if (this.entry.metaData.beforeDelete) {
            this.entry.metaData.beforeDelete(this.entry.entity, { mode: this.mode });
        }
        if (this.dbContext.beforeDelete) {
            this.dbContext.beforeDelete(this.entry.entity, { mode: this.mode });
        }
    }
    finalize() {
        if (!this._finalizeable)
            return;
        this._finalizeable = false;
        this.entry.acceptChanges();
        if (this.queryOption.afterDelete) {
            this.queryOption.afterDelete(this.entry.entity, { mode: this.mode });
        }
        if (this.entry.metaData.afterDelete) {
            this.entry.metaData.afterDelete(this.entry.entity, { mode: this.mode });
        }
        if (this.dbContext.afterDelete) {
            this.dbContext.afterDelete(this.entry.entity, { mode: this.mode });
        }
    }
    buildQueries(visitor) {
        const commandQuery = this.queryable.buildQuery(visitor);
        for (const colExp of commandQuery.entity.primaryColumns) {
            const parameter = commandQuery.addSqlParameter(visitor.newAlias("param"), new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", EntityEntry), "entity"), colExp.propertyName, colExp.type), colExp.columnMeta);
            commandQuery.addWhere(new StrictEqualExpression(colExp, parameter));
        }
        return [new DeleteExpression(commandQuery, this.mode)];
    }
    resultParser(results) {
        const effectedRow = super.resultParser(results);
        this._finalizeable = true;
        if (this.autoFinalize) {
            this.finalize();
        }
        return effectedRow;
    }
    getQueryCacheKey() {
        return hashCodeAdd(hashCode("DELETE", super.getQueryCacheKey()), hashCode(this.mode));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0RlbGV0ZURlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFLcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLG1CQUF1QixTQUFRLGdCQUFtQjtJQUMzRCxZQUErQixLQUFxQixFQUFxQixJQUFnQixFQUFTLGVBQXdCLElBQUk7UUFDMUgsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQURwQixVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUFxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQWdCO1FBRzFILElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENB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