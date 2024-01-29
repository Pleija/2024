import { ColumnGeneration } from "../../Common/Enum";
import { DbSet } from "../../Data/DbSet";
import { EntityState } from "../../Data/EntityState";
import { RelationEntry } from "../../Data/RelationEntry";
import { MemberAccessExpression } from "../../ExpressionBuilder/Expression/MemberAccessExpression";
import { NotEqualExpression } from "../../ExpressionBuilder/Expression/NotEqualExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { TernaryExpression } from "../../ExpressionBuilder/Expression/TernaryExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { hasFlags, hashCode, hashCodeAdd, isNull } from "../../Helper/Util";
import { InsertExpression } from "../../Queryable/QueryExpression/InsertExpression";
import { UpdateExpression } from "../../Queryable/QueryExpression/UpdateExpression";
import { DMLDeferredQuery } from "./DMLDeferredQuery";
export class RelationAddDeferredQuery extends DMLDeferredQuery {
    get insertProperties() {
        if (!this._insertProperties && this.entry.slaveRelation.relationData) {
            this._insertProperties = this.entry.slaveRelation.relationData.columns
                .where((o) => !hasFlags(o.generation, ColumnGeneration.Insert))
                .where((o) => !(o.defaultExp && isNull(this.entry.relationData[o.propertyName])))
                .select((o) => o.propertyName)
                .toArray();
        }
        return this._insertProperties;
    }
    constructor(entry, autoFinalize = true) {
        super((entry.slaveRelation.relationData
            ? new DbSet(entry.slaveRelation.relationData.type, entry.slaveEntry.dbSet.dbContext)
            : entry.slaveEntry.dbSet).parameter({ entry: entry }));
        this.entry = entry;
        this.autoFinalize = autoFinalize;
        this.relationId = {};
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
        if (this.entry.slaveRelation.relationData) {
            // create new data entity
            const queryExp = this.queryable.buildQuery(visitor);
            const value = {};
            const relationParam = new ParameterExpression("relationId", Object);
            const dataEntity = new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "relationData");
            for (const prop of this.insertProperties) {
                const relationIdValue = new MemberAccessExpression(relationParam, prop);
                const entityValue = new MemberAccessExpression(dataEntity, prop);
                const relationIdExist = new NotEqualExpression(relationIdValue, new ValueExpression(null));
                value[prop] = queryExp.addSqlParameter(visitor.newAlias("param"), new TernaryExpression(relationIdExist, relationIdValue, entityValue));
            }
            const slaveEntity = new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "slaveEntry"), "entity");
            for (const [sCol, tCol] of this.entry.slaveRelation.relationData.targetRelationMaps) {
                const relationIdValue = new MemberAccessExpression(relationParam, sCol.propertyName);
                const entityValue = new MemberAccessExpression(slaveEntity, tCol.propertyName);
                const relationIdExist = new NotEqualExpression(relationIdValue, new ValueExpression(null));
                const oldParam = value[sCol.propertyName];
                if (oldParam) {
                    queryExp.parameterTree.node.delete(oldParam);
                }
                value[sCol.propertyName] = queryExp.addSqlParameter(visitor.newAlias("param"), new TernaryExpression(relationIdExist, relationIdValue, entityValue));
            }
            const masterEntity = new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "masterEntry"), "entity");
            for (const [sCol, tCol] of this.entry.slaveRelation.relationData.sourceRelationMaps) {
                const relationIdValue = new MemberAccessExpression(relationParam, sCol.propertyName);
                const entityValue = new MemberAccessExpression(masterEntity, tCol.propertyName);
                const relationIdExist = new NotEqualExpression(relationIdValue, new ValueExpression(null));
                const oldParam = value[sCol.propertyName];
                if (oldParam) {
                    queryExp.parameterTree.node.delete(oldParam);
                }
                value[sCol.propertyName] = queryExp.addSqlParameter(visitor.newAlias("param"), new TernaryExpression(relationIdExist, relationIdValue, entityValue));
            }
            results.push(new InsertExpression(queryExp.entity, [value]));
        }
        if (this.entry.slaveEntry.state !== EntityState.Added && this.entry.slaveRelation.relationType === "one") {
            const queryExp = (this.entry.slaveRelation.relationData ? this.entry.slaveEntry.dbSet.parameter({ entry: this.entry }) : this.queryable).buildQuery(visitor);
            const slaveEntity = new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "slaveEntry"), "entity");
            for (const colExp of queryExp.entity.primaryColumns) {
                const parameter = queryExp.addSqlParameter(visitor.newAlias("param"), new MemberAccessExpression(slaveEntity, colExp.propertyName, colExp.type), colExp.columnMeta);
                queryExp.addWhere(new StrictEqualExpression(colExp, parameter));
            }
            // NOTE: is concurrency handling needed for one-many relation?
            const setter = {};
            const masterEntity = new MemberAccessExpression(new MemberAccessExpression(new ParameterExpression("entry", RelationEntry), "masterEntry"), "entity");
            const relationParam = new ParameterExpression("relationId", Object);
            for (const [sCol, tCol] of this.entry.slaveRelation.relationMaps) {
                const relationIdValue = new MemberAccessExpression(relationParam, sCol.propertyName);
                const relationIdExist = new NotEqualExpression(relationIdValue, new ValueExpression(null));
                const entityValue = new MemberAccessExpression(masterEntity, tCol.propertyName);
                setter[sCol.propertyName] = queryExp.addSqlParameter(visitor.newAlias("param"), new TernaryExpression(relationIdExist, relationIdValue, entityValue));
            }
            const updateExp = new UpdateExpression(queryExp, setter);
            updateExp.parameterTree = queryExp.parameterTree;
            results.push(updateExp);
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
        let propCode = 0;
        if (this.insertProperties) {
            propCode = this.insertProperties.select((o) => hashCode(o)).sum();
        }
        if (this.entry.slaveEntry.state !== EntityState.Added && this.entry.slaveRelation.relationType === "one") {
            propCode = hashCodeAdd(propCode, 1);
        }
        return hashCodeAdd(hashCode("RELATIONADD", super.getQueryCacheKey()), hashCode(this.entry.slaveRelation.fullName, propCode));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25BZGREZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L0RlZmVycmVkUXVlcnkvUmVsYXRpb25BZGREZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXpELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFHcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFHcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLHdCQUFxQyxTQUFRLGdCQUFxQjtJQUMzRSxJQUFjLGdCQUFnQjtRQUMx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