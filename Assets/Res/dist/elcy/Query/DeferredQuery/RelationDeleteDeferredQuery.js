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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25EZWxldGVEZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L0RlZmVycmVkUXVlcnkvUmVsYXRpb25EZWxldGVEZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUNuRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckYsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUdwRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUdwRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sMkJBQXdDLFNBQVEsZ0JBQXFCO0lBQzlFLFlBQStCLEtBQWdDLEVBQVMsZUFBd0IsSUFBSTtRQUNoRyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVk7WUFDbkMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENB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