import { Defer } from "../../Common/Defer";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionExecutor } from "../../ExpressionBuilder/ExpressionExecutor";
import { isNull } from "../../Helper/Util";
import { Diagnostic } from "../../Logger/Diagnostic";
import { EntityExpression } from "../../Queryable/QueryExpression/EntityExpression";
import { InsertExpression } from "../../Queryable/QueryExpression/InsertExpression";
import { SqlTableValueParameterExpression } from "../../Queryable/QueryExpression/SqlTableValueParameterExpression";
export class DeferredQuery {
    constructor(dbContext, queryOption) {
        this.dbContext = dbContext;
        this.queryOption = queryOption;
        this.dbContext.deferredQueries.push(this);
    }
    async execute() {
        // if has been resolved, return
        if (this.value !== undefined) {
            return this.value;
        }
        // if being resolved.
        if (!this.dbContext.deferredQueries.contains(this)) {
            if (!this._defer) {
                this._defer = new Defer();
            }
            return this._defer;
        }
        await this.dbContext.executeDeferred();
        return this.value;
    }
    toString() {
        return this.queries.select((o) => o.query).toArray().join("\n\n");
    }
    resolve(result) {
        let queries = this.queries;
        if (this.resultRange) {
            result = result.skip(this.resultRange[0]).take(this.resultRange[1]).toArray();
            queries = queries.skip(this.resultRange[0]).take(this.resultRange[1]).toArray();
        }
        this.value = this.resultParser(result, queries);
        if (this._defer) {
            this._defer.resolve(this.value);
        }
    }
    tvpQueries(tvpMap, queries) {
        if (tvpMap.size <= 0 || this.queryOption.supportTVP) {
            return queries;
        }
        const schemaBuilder = this.dbContext.schemaBuilder();
        let preQ = [];
        let postQ = [];
        for (const [tvpExp, arrayValues] of tvpMap) {
            const entityExp = new EntityExpression(tvpExp.entityMeta, "");
            let i = 0;
            const columns = entityExp.columns;
            const insertQuery = new InsertExpression(entityExp, [], columns);
            for (const item of arrayValues) {
                const itemExp = {};
                for (const col of columns) {
                    let valueExp = null;
                    switch (col.propertyName) {
                        case "__index": {
                            valueExp = new ValueExpression(i++);
                            break;
                        }
                        case "__value": {
                            valueExp = new ValueExpression(item);
                            break;
                        }
                        default: {
                            const propVal = item[col.propertyName];
                            valueExp = new ValueExpression(!isNull(propVal) ? propVal : null);
                            break;
                        }
                    }
                    itemExp[col.propertyName] = valueExp;
                    if (!col.columnMeta.columnType) {
                        const colType = this.dbContext.queryBuilder.valueColumnType(valueExp.value);
                        col.columnMeta.columnType = colType.columnType;
                        if (colType.option) {
                            for (const prop in colType.option) {
                                col.columnMeta[prop] = colType.option[prop];
                            }
                        }
                    }
                }
                insertQuery.values.push(itemExp);
            }
            const createQ = schemaBuilder.createTable(tvpExp.entityMeta);
            const insertQ = this.dbContext.queryBuilder.toQuery(insertQuery, this.queryOption)
                .select((o) => this.toQuery(o, null, null)).toArray();
            const deleteQ = schemaBuilder.dropTable(tvpExp.entityMeta);
            preQ = preQ.concat(createQ).concat(insertQ);
            postQ = postQ.concat(deleteQ);
        }
        this.resultRange = [preQ.length, queries.length];
        return preQ.concat(queries).concat(postQ);
    }
    toQuery(template, stackTree, tvpMap) {
        const paramTree = template.parameterTree;
        const timer = Diagnostic.timer();
        const result = {
            comment: template.comment,
            type: template.type,
            query: template.query,
            parameters: {}
        };
        if (stackTree) {
            const queryBuilder = this.dbContext.queryBuilder;
            let paramTrees = [paramTree];
            let stackTrees = [stackTree];
            let i = 0;
            while (paramTrees.length > i) {
                const paramNode = paramTrees[i];
                const stackNode = stackTrees[i++];
                const valueTransformer = new ExpressionExecutor(stackNode.node);
                for (const param of paramNode.node) {
                    const value = valueTransformer.execute(param);
                    if (!this.queryOption.supportTVP && param instanceof SqlTableValueParameterExpression) {
                        tvpMap.set(param, value);
                    }
                    else if (param.isReplacer) {
                        result.query = result.query.replace(queryBuilder.toString(param), value);
                    }
                    else {
                        result.parameters[param.name] = this.dbContext.queryBuilder.toParameterValue(value, param.column);
                    }
                }
                if (paramNode.childrens.any()) {
                    paramTrees = paramTrees.concat(paramNode.childrens);
                    stackTrees = stackTrees.concat(stackNode.childrens);
                }
            }
            if (Diagnostic.enabled) {
                Diagnostic.trace(this, `build params time: ${timer.lap()}ms`);
            }
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeS9EZWZlcnJlZFF1ZXJ5L0RlZmVycmVkUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBSTNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNoRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXJELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLGtFQUFrRSxDQUFDO0FBTXBILE1BQU0sT0FBZ0IsYUFBYTtJQUMvQixZQUN1QixTQUFvQixFQUN2QixXQUF5QjtRQUR0QixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXpDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBS00sS0FBSyxDQUFDLE9BQU87UUFDaEIsK0JBQStCO1FBQy9CLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQUNELHFCQUFxQjtRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxF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