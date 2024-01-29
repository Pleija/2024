import { ColumnGeneration, QueryType } from "../../Common/Enum";
import { TimeSpan } from "../../Common/TimeSpan";
import { Uuid } from "../../Common/Uuid";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { isNull } from "../../Helper/Util";
import { RowVersionColumnMetaData } from "../../MetaData/RowVersionColumnMetaData";
import { TempEntityMetaData } from "../../MetaData/TempEntityMetaData";
import { ColumnExpression } from "../../Queryable/QueryExpression/ColumnExpression";
import { EntityExpression } from "../../Queryable/QueryExpression/EntityExpression";
import { RelationalQueryBuilder } from "../Relational/RelationalQueryBuilder";
import { mssqlQueryTranslator } from "./MssqlQueryTranslator";
export class MssqlQueryBuilder extends RelationalQueryBuilder {
    constructor() {
        super(...arguments);
        this.queryLimit = {
            maxParameters: 2100,
            maxQueryLength: 67108864
        };
        this.translator = mssqlQueryTranslator;
        this.valueTypeMap = new Map([
            [Uuid, () => ({ columnType: "uniqueidentifier", group: "Identifier" })],
            [TimeSpan, () => ({ columnType: "time", group: "Time" })],
            [Date, () => ({ columnType: "datetime", group: "DateTime" })],
            [String, () => ({ columnType: "nvarchar", group: "String", option: { length: 255 } })],
            [Number, () => ({ columnType: "decimal", group: "Decimal", option: { precision: 18, scale: 0 } })],
            [Boolean, () => ({ columnType: "bit", group: "Boolean" })]
        ]);
    }
    enclose(identity) {
        if (this.namingStrategy.enableEscape && identity[0] !== "@" && identity[0] !== "#") {
            return "[" + identity + "]";
        }
        else {
            return identity;
        }
    }
    getInsertQuery(insertExp, option) {
        if (insertExp.values.length <= 0) {
            return [];
        }
        const param = {
            option: option,
            queryExpression: insertExp
        };
        const colString = insertExp.columns.select((o) => this.enclose(o.columnName)).toArray().join(", ");
        let output = insertExp.entity.columns.where((o) => !isNull(o.columnMeta))
            .where((o) => (o.columnMeta.generation & ColumnGeneration.Insert) !== 0 || !!o.columnMeta.defaultExp)
            .select((o) => `INSERTED.${this.enclose(o.columnName)} AS ${o.propertyName}`).toArray().join(", ");
        if (output) {
            output = " OUTPUT " + output;
        }
        const insertQuery = `INSERT INTO ${this.entityName(insertExp.entity)}(${colString})${output} VALUES`;
        let queryCommand = {
            query: insertQuery,
            parameterTree: insertExp.parameterTree,
            type: QueryType.DML
        };
        if (output) {
            queryCommand.type |= QueryType.DQL;
        }
        const result = [queryCommand];
        let count = 0;
        this.indent++;
        for (const itemExp of insertExp.values) {
            const isLimitExceed = this.queryLimit.maxParameters && (count + insertExp.columns.length) > this.queryLimit.maxParameters;
            if (isLimitExceed) {
                queryCommand.query = queryCommand.query.slice(0, -1);
                queryCommand = {
                    query: insertQuery,
                    parameterTree: insertExp.parameterTree,
                    type: QueryType.DML
                };
                count = 0;
                result.push(queryCommand);
            }
            const values = [];
            for (const col of insertExp.columns) {
                const valueExp = itemExp[col.propertyName];
                if (valueExp) {
                    values.push(this.toString(valueExp, param));
                    count++;
                }
                else {
                    values.push("DEFAULT");
                }
            }
            queryCommand.query += `${this.newLine()}(${values.join(",")}),`;
        }
        this.indent--;
        queryCommand.query = queryCommand.query.slice(0, -1);
        return result;
    }
    //#region Update
    getUpdateQuery(updateExp, option) {
        const result = [];
        const param = {
            option: option,
            queryExpression: updateExp
        };
        const setQuery = Object.keys(updateExp.setter).select((o) => {
            const value = updateExp.setter[o];
            const valueStr = this.toOperandString(value, param);
            const column = updateExp.entity.columns.first((c) => c.propertyName === o);
            return `${this.enclose(updateExp.entity.alias)}.${this.enclose(column.columnName)} = ${valueStr}`;
        }).toArray();
        if (updateExp.entity.metaData) {
            if (updateExp.entity.metaData.modifiedDateColumn) {
                const colMeta = updateExp.entity.metaData.modifiedDateColumn;
                // only update modifiedDate column if not explicitly specified in update set statement.
                if (!updateExp.setter[colMeta.propertyName]) {
                    const valueExp = new MethodCallExpression(new ValueExpression(Date), colMeta.timeZoneHandling === "utc" ? "utcTimestamp" : "timestamp", []);
                    const valueStr = this.toString(valueExp, param);
                    setQuery.push(`${this.enclose(updateExp.entity.alias)}.${this.enclose(colMeta.columnName)} = ${valueStr}`);
                }
            }
            if (updateExp.entity.metaData.versionColumn) {
                const colMeta = updateExp.entity.metaData.versionColumn;
                if (updateExp.setter[colMeta.propertyName]) {
                    throw new Error(`${colMeta.propertyName} is a version column and should not be update explicitly`);
                }
            }
        }
        let updateQuery = `UPDATE ${this.enclose(updateExp.entity.alias)}` +
            this.newLine() + `SET ${setQuery.join(", ")}` +
            this.newLine() + `FROM ${this.entityName(updateExp.entity)} AS ${this.enclose(updateExp.entity.alias)}` +
            this.getJoinQueryString(updateExp.joins, param);
        if (updateExp.where) {
            updateQuery += this.newLine() + "WHERE " + this.toLogicalString(updateExp.where, param);
        }
        result.push({
            query: updateQuery,
            parameterTree: updateExp.parameterTree,
            type: QueryType.DML
        });
        return result;
    }
    toParameterValue(input, column) {
        if (isNull(input)) {
            return null;
        }
        if (column instanceof ColumnExpression && column.columnMeta instanceof RowVersionColumnMetaData) {
            return new Uint8Array(input.buffer ? input.buffer : input);
        }
        return super.toParameterValue(input, column);
    }
    //#endregion
    toPropertyValue(input, column) {
        if (column instanceof RowVersionColumnMetaData) {
            return new column.type(input.buffer ? input.buffer : input);
        }
        return super.toPropertyValue(input, column);
    }
    entityName(entityExp, param) {
        if (entityExp instanceof EntityExpression && entityExp.metaData instanceof TempEntityMetaData) {
            return this.enclose("#" + entityExp.name);
        }
        return this.enclose(entityExp.name);
    }
    getPagingQueryString(select, take, skip) {
        let result = "";
        if (select.orders.length <= 0) {
            result += "ORDER BY (SELECT NULL)" + this.newLine();
        }
        result += "OFFSET " + this.toString(skip) + " ROWS";
        if (take) {
            result += this.newLine() + "FETCH NEXT " + this.toString(take) + " ROWS ONLY";
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxRdWVyeUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Qcm92aWRlci9Nc3NxbC9Nc3NxbFF1ZXJ5QnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFaEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWpELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUd6QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBSXZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBTXBGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTlFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTlELE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxzQkFBc0I7SUFBN0Q7O1FBQ1csZUFBVSxHQUFnQjtZQUM3QixhQUFhLEVBQUUsSUFBSTtZQUNuQixjQUFjLEVBQUUsUUFBUTtTQUMzQixDQUFDO1FBQ0ssZUFBVSxHQUFHLG9CQUFvQixDQUFDO1FBQ2xDLGlCQUFZLEdBQUcsSUFBSSxHQUFHLENBQXdFO1lBQ2pHLENBQUMsSUFB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