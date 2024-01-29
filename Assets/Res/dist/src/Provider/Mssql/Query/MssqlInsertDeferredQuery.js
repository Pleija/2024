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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxJbnNlcnREZWZlcnJlZFF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUHJvdmlkZXIvTXNzcWwvUXVlcnkvTXNzcWxJbnNlcnREZWZlcnJlZFF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdURBQXVELENBQUM7QUFFeEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sOERBQThELENBQUM7QUFDdEcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDaEcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDNUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBSXZGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBR3ZGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBRW5HLE1BQU0sT0FBTyx3QkFBNEIsU0FBUSxtQkFBc0I7SUFDbkUsWUFBWSxLQUFxQixFQUFFLGVBQXdCLElBQUk7UUFDM0QsS0FBSyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ1MsWUFBWSxDQUFDLE9BQXNCO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMxRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxP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