import { EntityEntry } from "../../../Data/EntityEntry";
import { EqualExpression } from "../../../ExpressionBuilder/Expression/EqualExpression";
import { MemberAccessExpression } from "../../../ExpressionBuilder/Expression/MemberAccessExpression";
import { ParameterExpression } from "../../../ExpressionBuilder/Expression/ParameterExpression";
import { TernaryExpression } from "../../../ExpressionBuilder/Expression/TernaryExpression";
import { ValueExpression } from "../../../ExpressionBuilder/Expression/ValueExpression";
import { InsertDeferredQuery } from "../../../Query/DeferredQuery/InsertDeferredQuery";
import { InsertExpression } from "../../../Queryable/QueryExpression/InsertExpression";
import { SqlParameterExpression } from "../../../Queryable/QueryExpression/SqlParameterExpression";
export class MssqlInsertDeferredQuery extends InsertDeferredQuery {
    constructor(entry, autoFinalize = true) {
        super(entry, autoFinalize);
    }
    buildQueries(visitor) {
        const results = [];
        this.queryable.parameter({ relationId: this.relationId });
        const queryExp = this.queryable.buildQuery(visitor);
        const value = {};
        const entityExp = new MemberAccessExpression(new ParameterExpression("entry", EntityEntry), "entity");
        for (const colMeta of this.insertProperties) {
            value[colMeta.propertyName] = queryExp.addSqlParameter(visitor.newAlias("param"), new MemberAccessExpression(entityExp, colMeta.propertyName), colMeta);
        }
        const relations = this.entry.metaData.relations
            .where((o) => !o.nullable && !o.isMaster && o.relationType === "one" && !!o.relationMaps)
            .selectMany((o) => o.relationColumns);
        // relation id always used value from master.
        const relationIdExp = new ParameterExpression("relationId", Object);
        for (const sCol of relations) {
            const relationIdValue = new MemberAccessExpression(relationIdExp, sCol.propertyName);
            const entityValue = new MemberAccessExpression(entityExp, sCol.propertyName);
            const relationIdNotExist = new EqualExpression(relationIdValue, new ValueExpression(null));
            const existingParam = value[sCol.propertyName];
            if (existingParam instanceof SqlParameterExpression) {
                queryExp.parameterTree.node.delete(existingParam);
            }
            value[sCol.propertyName] = queryExp.addSqlParameter(visitor.newAlias("param"), new TernaryExpression(relationIdNotExist, entityValue, relationIdValue));
        }
        const insertExp = new InsertExpression(queryExp.entity, [value]);
        insertExp.parameterTree = queryExp.parameterTree;
        results.push(insertExp);
        return results;
    }
    resultParser(results, queries) {
        let effectedRow = 0;
        for (let i = 0, len = queries.length; i < len; i++) {
            const result = results[i];
            effectedRow += result.effectedRows;
            // Apply new update generated column value
            if (result.rows && result.rows.any()) {
                const data = result.rows[0];
                this.data = {};
                const queryBuilder = this.dbContext.queryBuilder;
                for (const prop in data) {
                    const column = this.entry.metaData.columns.first((o) => o.columnName === prop);
                    if (column) {
                        this.data[column.propertyName] = queryBuilder.toPropertyValue(data[prop], column);
                    }
                }
            }
        }
        this.finalizeable = true;
        if (this.autoFinalize) {
            this.finalize();
        }
        return effectedRow;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxJbnNlcnREZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1Byb3ZpZGVyL01zc3FsL1F1ZXJ5L01zc3FsSW5zZXJ0RGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBRXhGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDhEQUE4RCxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQzVGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUN4RixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUl2RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUd2RixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUVuRyxNQUFNLE9BQU8sd0JBQTRCLFNBQVEsbUJBQXNCO0lBQ25FLFlBQVksS0FBcUIsRUFBRSxlQUF3QixJQUFJO1FBQzNELEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNTLFlBQVksQ0FBQyxPQUFzQjtRQUN6QyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMs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