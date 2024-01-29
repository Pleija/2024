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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25BZGREZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvRGVmZXJyZWRRdWVyeS9SZWxhdGlvbkFkZERlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFekQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDbkcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDekYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUdwRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUdwRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sd0JBQXFDLFNBQVEsZ0JBQXFCO0lBQzNFLElBQWMsZ0JBQWdCO1FBQzFC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