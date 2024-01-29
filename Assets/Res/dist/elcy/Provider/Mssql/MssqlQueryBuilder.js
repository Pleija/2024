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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXNzcWxRdWVyeUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUHJvdmlkZXIvTXNzcWwvTXNzcWxRdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWhFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHekMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNuRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUl2RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNwRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQU1wRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU5RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUU5RCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsc0JBQXNCO0lBQTdEOztRQUNXLGVBQVUsR0FBZ0I7WUFDN0IsYUFBYSxFQUFFLElBQUk7WUFDbkIsY0FBYyxFQUFFLFFBQVE7U0FDM0IsQ0FBQztRQUNLLGVBQVUsR0FBRyxvQkFBb0IsQ0FBQztRQUNsQyxpQkFBWSxHQUFHLElBQUksR0FBRyxDQUF3RTtZQUNqRyxDQUFDLElB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