import { DbSet } from "../../Data/DbSet";
import { EntityState } from "../../Data/EntityState";
import { RelationEntry } from "../../Data/RelationEntry";
import { RelationState } from "../../Data/RelationState";
import { MemberAccessExpression } from "../../ExpressionBuilder/Expression/MemberAccessExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { hashCode, hashCodeAdd } from "../../Helper/Util";
import { DeleteExpression } from "../../Queryable/QueryExpression/DeleteExpression";
import { UpdateExpression } from "../../Queryable/QueryExpression/UpdateExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
export class RelationDeleteDeferredQuery extends DMLDeferredQuery {
    constructor(entry, autoFinalize = true) {
        super((entry.slaveRelation.relationData
            ? new DbSet(entry.slaveRelation.relationData.type, entry.slaveEntry.dbSet.dbContext)
            : entry.slaveEntry.dbSet).parameter({ entry: entry }));
        this.entry = entry;
        this.autoFinalize = autoFinalize;
        this.queryable.parameter({ relationId: this.relationId });
    }
    finalize() {
        if (!this._finalizeable)
            return;
        this._finalizeable = false;
        this.entry.acceptChanges();
    }
    buildQueries(visitor) {
        const results = [];
        // Delete relation Data
        if (this.entry.slaveRelation.relationData) {
            const queryExp = this.queryable.buildQuery(visitor);
            const dataEntity = new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "relationData");
            for (const colExp of queryExp.entity.primaryColumns) {
                const parameter = queryExp.addSqlParameter(visitor.newAlias("param"), new MemberAccessExpression(dataEntity, colExp.propertyName, colExp.type), colExp.columnMeta);
                queryExp.addWhere(new StrictEqualExpression(colExp, parameter));
            }
            results.push(new DeleteExpression(queryExp, this.entry.slaveRelation.relationData.deletedColumn ? "soft" : "hard"));
        }
        if (this.entry.slaveEntry.state !== EntityState.Deleted
            && this.entry.slaveRelation.relationType === "one"
            // Skip if same relation being added (change master)
            && !(this.entry.slaveEntry.relationMap[this.entry.slaveRelation.propertyName] || []).asEnumerable()
                .any(([, o]) => o.state === RelationState.Added)) {
            const queryExp = (this.entry.slaveRelation.relationData ? this.entry.slaveEntry.dbSet.parameter({ entry: this.entry }) : this.queryable).buildQuery(visitor);
            const slaveEntity = new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "slaveEntry"), "entity");
            for (const colExp of queryExp.entity.primaryColumns) {
                const parameter = queryExp.addSqlParameter(visitor.newAlias("param"), new MemberAccessExpression(slaveEntity, colExp.propertyName, colExp.type), colExp.columnMeta);
                queryExp.addWhere(new StrictEqualExpression(colExp, parameter));
            }
            if (this.entry.slaveRelation.nullable) {
                // Update Foreign Key. Set to NULL
                const setter = {};
                for (const sCol of this.entry.slaveRelation.relationColumns) {
                    setter[sCol.propertyName] = new ValueExpression(null);
                }
                results.push(new UpdateExpression(queryExp, setter));
            }
            else {
                // Delete slave entity
                results.push(new DeleteExpression(queryExp, this.entry.slaveEntry.metaData.deletedColumn ? "soft" : "hard"));
            }
        }
        return results;
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
        const relCode = ~(this.entry.slaveEntry.state !== EntityState.Deleted
            && this.entry.slaveRelation.relationType === "one"
            // Skip if same relation being added (change master)
            && !(this.entry.slaveEntry.relationMap[this.entry.slaveRelation.propertyName] || []).asEnumerable()
                .any(([, o]) => o.state === RelationState.Added));
        return hashCodeAdd(hashCode("RELATIONDELETE", super.getQueryCacheKey()), hashCode(this.entry.slaveRelation.fullName, relCode));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25EZWxldGVEZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvRGVmZXJyZWRRdWVyeS9SZWxhdGlvbkRlbGV0ZURlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXpELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBR3BGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBR3BGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTywyQkFBd0MsU0FBUSxnQkFBcUI7SUFDOUUsWUFBK0IsS0FBZ0MsRUFBUyxlQUF3QixJQUFJO1FBQ2hHLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWTtZQUNuQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FB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