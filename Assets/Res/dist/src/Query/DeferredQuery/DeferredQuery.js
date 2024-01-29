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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZXJyZWRRdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5L0RlZmVycmVkUXVlcnkvRGVmZXJyZWRRdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFJM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFckQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sa0VBQWtFLENBQUM7QUFNcEgsTUFBTSxPQUFnQixhQUFhO0lBQy9CLFlBQ3VCLFNBQW9CLEVBQ3ZCLFdBQXlCO1FBRHRCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDdkIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFFekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFLTSxLQUFLLENBQUMsT0FBTztRQUNoQiwrQkFBK0I7UUFDL0IsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzNCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBQ0QscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVB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