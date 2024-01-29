import "reflect-metadata";
import { NullConstructor } from "../../Common/Constant";
import { QueryType } from "../../Common/Enum";
import { TimeSpan } from "../../Common/TimeSpan";
import { Uuid } from "../../Common/Uuid";
import { entityMetaKey } from "../../Decorator/DecoratorKey";
import { AdditionExpression } from "../../ExpressionBuilder/Expression/AdditionExpression";
import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { ArrayValueExpression } from "../../ExpressionBuilder/Expression/ArrayValueExpression";
import { EqualExpression } from "../../ExpressionBuilder/Expression/EqualExpression";
import { FunctionCallExpression } from "../../ExpressionBuilder/Expression/FunctionCallExpression";
import { InstantiationExpression } from "../../ExpressionBuilder/Expression/InstantiationExpression";
import { MemberAccessExpression } from "../../ExpressionBuilder/Expression/MemberAccessExpression";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { ObjectValueExpression } from "../../ExpressionBuilder/Expression/ObjectValueExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { TernaryExpression } from "../../ExpressionBuilder/Expression/TernaryExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { ExpressionExecutor } from "../../ExpressionBuilder/ExpressionExecutor";
import { isColumnExp, isEntityExp, isNull, mapReplaceExp, toDateTimeString, toHexaString, toTimeString } from "../../Helper/Util";
import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { RowVersionColumnMetaData } from "../../MetaData/RowVersionColumnMetaData";
import { TimeColumnMetaData } from "../../MetaData/TimeColumnMetaData";
import { DbFunction } from "../../Query/DbFunction";
import { HavingJoinRelation } from "../../Queryable/Interface/HavingJoinRelation";
import { IncludeRelation } from "../../Queryable/Interface/IncludeRelation";
import { JoinRelation } from "../../Queryable/Interface/JoinRelation";
import { ColumnExpression } from "../../Queryable/QueryExpression/ColumnExpression";
import { ComputedColumnExpression } from "../../Queryable/QueryExpression/ComputedColumnExpression";
import { DeleteExpression } from "../../Queryable/QueryExpression/DeleteExpression";
import { EntityExpression } from "../../Queryable/QueryExpression/EntityExpression";
import { ExceptExpression } from "../../Queryable/QueryExpression/ExceptExpression";
import { GroupByExpression } from "../../Queryable/QueryExpression/GroupByExpression";
import { InsertExpression } from "../../Queryable/QueryExpression/InsertExpression";
import { InsertIntoExpression } from "../../Queryable/QueryExpression/InsertIntoExpression";
import { IntersectExpression } from "../../Queryable/QueryExpression/IntersectExpression";
import { ProjectionEntityExpression } from "../../Queryable/QueryExpression/ProjectionEntityExpression";
import { RawEntityExpression } from "../../Queryable/QueryExpression/RawEntityExpression";
import { RawSqlExpression } from "../../Queryable/QueryExpression/RawSqlExpression";
import { SelectExpression } from "../../Queryable/QueryExpression/SelectExpression";
import { SqlParameterExpression } from "../../Queryable/QueryExpression/SqlParameterExpression";
import { SqlTableValueParameterExpression } from "../../Queryable/QueryExpression/SqlTableValueParameterExpression";
import { UnionExpression } from "../../Queryable/QueryExpression/UnionExpression";
import { UpdateExpression } from "../../Queryable/QueryExpression/UpdateExpression";
import { UpsertExpression } from "../../Queryable/QueryExpression/UpsertExpression";
import { relationalQueryTranslator } from "./RelationalQueryTranslator";
export class RelationalQueryBuilder {
    constructor() {
        this.translator = relationalQueryTranslator;
        //#region Formatting
        this.indent = 0;
        this.aliasObj = {};
        //#endregion
    }
    get lastInsertIdQuery() {
        if (!this._lastInsertedIdQuery) {
            /* istanbul ignore next */
            this._lastInsertedIdQuery = this.toString(ExpressionBuilder.parse(() => DbFunction.lastInsertedId()).body);
        }
        return this._lastInsertedIdQuery;
    }
    columnTypeString(columnType) {
        let type = columnType.columnType;
        if (columnType.option) {
            const option = columnType.option;
            if (!isNull(option.length) || !isNull(option.size)) {
                type += `(${option.length || option.size})`;
            }
            else if (!isNull(option.precision)) {
                type += !isNull(option.scale) ? `(${option.precision}, ${option.scale})` : `(${option.precision})`;
            }
        }
        return type;
    }
    enclose(identity) {
        if (this.namingStrategy.enableEscape && identity && identity[0] !== "@" && identity[0] !== "#") {
            return "\"" + identity + "\"";
        }
        else {
            return identity;
        }
    }
    //#endregion
    newAlias(type = "entity") {
        if (!this.aliasObj[type]) {
            this.aliasObj[type] = 0;
        }
        return this.namingStrategy.getAlias(type) + this.aliasObj[type]++;
    }
    newLine(indent = 0, isAdd = true) {
        indent += this.indent;
        if (isAdd) {
            this.indent = indent;
        }
        return "\n" + (Array(indent + 1).join("\t"));
    }
    resolveTranslator(object, memberName) {
        return this.translator.resolve(object, memberName);
    }
    toLogicalString(expression, param) {
        if (isColumnExp(expression)) {
            expression = new EqualExpression(expression, new ValueExpression(true));
        }
        return this.toString(expression, param);
    }
    toOperandString(expression, param) {
        if (isEntityExp(expression)) {
            // TODO: dead code
            const column = expression.primaryColumns.length > 0 ? expression.primaryColumns[0] : expression.columns[0];
            return this.getColumnQueryString(column, param);
        }
        else if (expression.type === Boolean && !(expression instanceof ValueExpression) && !isColumnExp(expression)) {
            expression = new TernaryExpression(expression, new ValueExpression(true), new ValueExpression(false));
        }
        return this.toString(expression, param);
    }
    toParameterValue(input, column) {
        if (isNull(input)) {
            return null;
        }
        let result = input;
        const type = column ? column.type : !isNull(input) ? input.constructor : NullConstructor;
        switch (type) {
            case Date: {
                const timeZoneHandling = column instanceof DateTimeColumnMetaData ? column.timeZoneHandling : "none";
                if (timeZoneHandling !== "none") {
                    result = result.toUTCDate();
                }
                break;
            }
            case TimeSpan: {
                result = typeof input === "number" ? new TimeSpan(input) : TimeSpan.parse(input);
                const timeZoneHandling = column instanceof TimeColumnMetaData ? column.timeZoneHandling : "none";
                if (timeZoneHandling !== "none") {
                    result = result.addMinutes((new Date(result.totalMilliSeconds())).getTimezoneOffset());
                }
                break;
            }
            case ArrayBuffer:
            case Uint8Array:
            case Uint16Array:
            case Uint32Array:
            case Int8Array:
            case Int16Array:
            case Int32Array:
            case Uint8ClampedArray:
            case Float32Array:
            case Float64Array:
            case DataView: {
                result = new Uint8Array(input.buffer ? input.buffer : input);
                if (column instanceof ColumnExpression && column.columnMeta instanceof RowVersionColumnMetaData) {
                    return new DataView(result.buffer).getUint32(0);
                }
                break;
            }
        }
        return result;
    }
    //#endregion
    //#region Value Convert
    toPropertyValue(input, column) {
        let result;
        if (input === null && column.nullable) {
            return null;
        }
        switch (column.type) {
            case Boolean:
                result = Boolean(input);
                break;
            case Number:
                result = Number.parseFloat(input);
                if (!isFinite(result)) {
                    result = column.nullable ? null : 0;
                }
                break;
            case String:
                result = input ? input.toString() : input;
                break;
            case Date: {
                result = new Date(input);
                const timeZoneHandling = column instanceof DateTimeColumnMetaData ? column.timeZoneHandling : "none";
                if (timeZoneHandling !== "none") {
                    result = result.fromUTCDate();
                }
                break;
            }
            case TimeSpan: {
                result = typeof input === "string" ? TimeSpan.parse(input) : new TimeSpan(input);
                const timeZoneHandling = column instanceof TimeColumnMetaData ? column.timeZoneHandling : "none";
                if (timeZoneHandling !== "none") {
                    result = result.addMinutes(-(new Date(result.totalMilliSeconds())).getTimezoneOffset());
                }
                break;
            }
            case Uuid: {
                result = input ? new Uuid(input.toString()) : Uuid.empty;
                break;
            }
            case ArrayBuffer: {
                result = input.buffer ? input.buffer : input;
                break;
            }
            case Uint8Array:
            case Uint16Array:
            case Uint32Array:
            case Int8Array:
            case Int16Array:
            case Int32Array:
            case Uint8ClampedArray:
            case Float32Array:
            case Float64Array:
            case DataView: {
                if (typeof input === "number") {
                    const dataView = new DataView(new ArrayBuffer(4));
                    dataView.setUint32(0, input);
                    input = dataView.buffer;
                }
                result = new column.type(input.buffer ? input.buffer : input);
                break;
            }
            default:
                throw new Error(`${column.type.name} not supported`);
        }
        return result;
    }
    //#region Query
    toQuery(queryExp, option) {
        let result = [];
        if (queryExp instanceof SelectExpression) {
            result = this.getSelectQuery(queryExp, option);
        }
        else if (queryExp instanceof InsertIntoExpression) {
            result = this.getInsertIntoQuery(queryExp, option);
        }
        else if (queryExp instanceof InsertExpression) {
            result = this.getInsertQuery(queryExp, option);
        }
        else if (queryExp instanceof UpdateExpression) {
            result = this.getUpdateQuery(queryExp, option);
        }
        else if (queryExp instanceof UpsertExpression) {
            result = this.getUpsertQuery(queryExp, option);
        }
        else if (queryExp instanceof DeleteExpression) {
            result = this.getDeleteQuery(queryExp, option);
        }
        return result;
    }
    toString(expression, param) {
        let result = "";
        switch (expression.constructor) {
            case MemberAccessExpression:
                result = this.toMemberAccessString(expression, param);
                break;
            case MethodCallExpression:
                result = this.toMethodCallString(expression, param);
                break;
            case FunctionCallExpression:
                result = this.toFunctionCallString(expression, param);
                break;
            case SqlTableValueParameterExpression:
            case SqlParameterExpression:
                result = this.toSqlParameterString(expression, param);
                break;
            case ArrayValueExpression:
                result = this.toArrayString(expression, param);
                break;
            case ValueExpression:
                result = this.toValueString(expression);
                break;
            case InstantiationExpression:
                result = this.toInstantiationString(expression, param);
                break;
            case RawSqlExpression:
                result = this.toRawSqlString(expression);
                break;
            default: {
                if (expression instanceof SelectExpression) {
                    return this.getSelectQueryString(expression, param) /*+ (expression.isSubSelect ? "" : ";")*/;
                }
                else if (isColumnExp(expression)) {
                    return this.getColumnQueryString(expression, param);
                }
                else if (isEntityExp(expression)) {
                    return this.getEntityQueryString(expression, param);
                }
                else if (expression instanceof TernaryExpression) {
                    return this.toOperatorString(expression, param);
                }
                else if (expression.rightOperand) {
                    return `(${this.toOperatorString(expression, param)})`;
                }
                else if (expression.operand) {
                    return this.toOperatorString(expression, param);
                }
                throw new Error(`Expression ${expression.toString()} not supported`);
            }
        }
        return result;
    }
    //#endregion
    //#region Value
    valueString(value) {
        if (!isNull(value)) {
            switch (value.constructor) {
                case Number:
                    return this.numberString(value);
                case Boolean:
                    return this.booleanString(value);
                case String:
                    return this.stringString(value);
                case Date:
                    return this.dateTimeString(value);
                case TimeSpan:
                    return this.timeString(value);
                case Uuid:
                    return this.identifierString(value);
                case ArrayBuffer:
                case Uint8Array:
                case Uint16Array:
                case Uint32Array:
                case Int8Array:
                case Int16Array:
                case Int32Array:
                case Uint8ClampedArray:
                case Float32Array:
                case Float64Array:
                case DataView:
                    return toHexaString(value);
                default:
                    throw new Error(`type "${value.constructor.name}" not supported`);
            }
        }
        return this.nullString();
    }
    booleanString(value) {
        return value ? "1" : "0";
    }
    dateTimeString(value) {
        return this.stringString(toDateTimeString(value));
    }
    valueColumnType(value) {
        const colTypeFactory = this.valueTypeMap.get(!isNull(value) ? value.constructor : String);
        return colTypeFactory(value);
    }
    //#endregion
    //#region refactor
    extractValue(exp, param) {
        if (exp instanceof ValueExpression) {
            return exp.value;
        }
        // else if (exp instanceof SqlParameterExpression) {
        //     param.queryExpression.parameterTree.node;
        //     const takeParam = exp. param.parameters.get(exp);
        //     if (takeParam) {
        //         return takeParam.value as T;
        //     }
        // }
        return null;
    }
    getColumnQueryString(column, param) {
        if (param && param.queryExpression) {
            if (param.queryExpression instanceof SelectExpression) {
                const commandExp = param.queryExpression;
                if (column.entity.alias === commandExp.entity.alias || (commandExp instanceof GroupByExpression && isEntityExp(commandExp.key) && commandExp.key.alias === column.entity.alias)) {
                    if (column instanceof ComputedColumnExpression && (param.state !== "column-declared" || !commandExp.resolvedSelects.contains(column))) {
                        return this.toOperandString(column.expression, param);
                    }
                    return this.enclose(column.entity.alias) + "." + this.enclose(column.columnName);
                }
                else {
                    let childSelect = commandExp.resolvedJoins.select((o) => o.child).first((selectExp) => selectExp.allSelects.any((o) => o.entity.alias === column.entity.alias));
                    if (!childSelect) {
                        childSelect = commandExp.parentRelation.parent;
                    }
                    const useAlias = !commandExp.selects.contains(column);
                    return this.enclose(childSelect.entity.alias) + "." + this.enclose(useAlias ? column.dataPropertyName : column.columnName);
                }
            }
            return this.enclose(column.entity.alias) + "." + this.enclose(column.dataPropertyName);
        }
        return this.enclose(column.dataPropertyName);
    }
    getDeleteQuery(deleteExp, option) {
        let result = [];
        const param = {
            queryExpression: deleteExp,
            option: option
        };
        let mode = deleteExp.mode;
        if (!mode) {
            mode = deleteExp.entity.deleteColumn ? "soft" : "hard";
        }
        else if (mode === "soft" && !deleteExp.entity.deleteColumn) {
            // if entity did not support soft delete, then abort.
            throw new Error(`'${deleteExp.entity.name}' did not support 'Soft' delete`);
        }
        if (mode === "soft") {
            // if soft delete, set delete column to true
            const set = {};
            set[deleteExp.entity.deleteColumn.propertyName] = new ValueExpression(true);
            const updateQuery = new UpdateExpression(deleteExp.select, set);
            result = this.getUpdateQuery(updateQuery, param.option);
            // apply delete option rule. coz soft delete delete option will not handled by db.
            const entityMeta = Reflect.getOwnMetadata(entityMetaKey, deleteExp.entity.type);
            const relations = entityMeta.relations.where((o) => o.isMaster);
            result = result.concat(relations.selectMany((o) => {
                const isManyToMany = o.completeRelationType === "many-many";
                const target = !isManyToMany ? o.target : o.relationData;
                const deleteOption = !isManyToMany ? o.reverseRelation.deleteOption : o.relationData.deleteOption;
                const relationColumns = !isManyToMany ? o.reverseRelation.relationColumns : o.relationData.source === entityMeta ? o.relationData.sourceRelationColumns : o.relationData.targetRelationColumns;
                const child = new SelectExpression(new EntityExpression(target.type, target.type.name));
                child.addJoin(deleteExp.select, o.reverseRelation, "INNER");
                // TODO: Handle this at join
                child.parameterTree = {
                    node: deleteExp.parameterTree.node.slice(),
                    childrens: deleteExp.parameterTree.childrens.slice()
                };
                switch (deleteOption) {
                    case "CASCADE": {
                        const childDelete = new DeleteExpression(child, deleteExp.mode);
                        if (childDelete.entity.deleteColumn && !param.option.includeSoftDeleted) {
                            childDelete.addWhere(new StrictEqualExpression(childDelete.entity.deleteColumn, new ValueExpression(false)));
                        }
                        return this.getDeleteQuery(childDelete, param.option);
                    }
                    case "SET NULL": {
                        const setOption = {};
                        for (const col of relationColumns) {
                            setOption[col.propertyName] = new ValueExpression(null);
                        }
                        const childUpdate = new UpdateExpression(child, setOption);
                        return this.getUpdateQuery(childUpdate, param.option);
                    }
                    case "SET DEFAULT": {
                        const setOption = {};
                        for (const col of o.reverseRelation.relationColumns) {
                            if (col.defaultExp) {
                                setOption[col.columnName] = col.defaultExp.body;
                            }
                            else {
                                setOption[col.columnName] = new ValueExpression(null);
                            }
                        }
                        const childUpdate = new UpdateExpression(child, setOption);
                        return this.getUpdateQuery(childUpdate, param.option);
                    }
                    case "NO ACTION":
                    case "RESTRICT":
                    default:
                        return [];
                }
            }).toArray());
        }
        else {
            let deleteQueryStr = `DELETE ${this.enclose(deleteExp.entity.alias)}` +
                this.newLine() + `FROM ${this.entityName(deleteExp.entity)} AS ${this.enclose(deleteExp.entity.alias)}` +
                this.getJoinQueryString(deleteExp.joins, param);
            if (deleteExp.where) {
                deleteQueryStr += this.newLine() + "WHERE " + this.toLogicalString(deleteExp.where, param);
            }
            result.push({
                query: deleteQueryStr,
                type: QueryType.DML,
                parameterTree: deleteExp.parameterTree
            });
        }
        const clone = deleteExp.clone();
        const replaceMap = new Map();
        for (const col of deleteExp.entity.columns) {
            const cloneCol = clone.entity.columns.first((c) => c.columnName === col.columnName);
            replaceMap.set(col, cloneCol);
        }
        const includedDeletes = deleteExp.includes.selectMany((o) => {
            const child = o.child.clone();
            for (const col of o.child.entity.columns) {
                const cloneChildCol = child.entity.columns.first((c) => c.columnName === col.columnName);
                replaceMap.set(col, cloneChildCol);
            }
            const relations = o.relations.clone(replaceMap);
            child.addJoin(clone.select, relations, "INNER");
            if (clone.select.where) {
                child.addWhere(clone.select.where);
                clone.select.where = null;
            }
            return this.getDeleteQuery(child, param.option);
        }).toArray();
        result = result.concat(includedDeletes);
        return result;
    }
    getEntityQueryString(entity, param) {
        if (entity instanceof IntersectExpression) {
            return "(" + this.newLine(1) + this.getSelectQueryString(entity.subSelect, param) +
                this.newLine() + "INTERSECT" +
                this.newLine() + this.getSelectQueryString(entity.subSelect2, param) + this.newLine(-1) + ") AS " + this.enclose(entity.alias);
        }
        else if (entity instanceof UnionExpression) {
            const unionAllExp = entity.isUnionAll;
            const newUnionAllExp = new SqlParameterExpression(unionAllExp.name, new TernaryExpression(unionAllExp.valueExp, new ValueExpression(" ALL"), new ValueExpression("")));
            newUnionAllExp.isReplacer = true;
            param.queryExpression.replaceSqlParameter(unionAllExp, newUnionAllExp);
            return "(" + this.newLine(1) + this.getSelectQueryString(entity.subSelect, param) +
                this.newLine() + "UNION" + this.toString(newUnionAllExp) +
                this.newLine() + this.getSelectQueryString(entity.subSelect2, param) + this.newLine(-1) + ") AS " + this.enclose(entity.alias);
        }
        else if (entity instanceof ExceptExpression) {
            return "(" + this.newLine(+1) + this.getSelectQueryString(entity.subSelect, param) +
                this.newLine() + "EXCEPT" +
                this.newLine() + this.getSelectQueryString(entity.subSelect2, param) + this.newLine(-1) + ") AS " + this.enclose(entity.alias);
        }
        else if (entity instanceof ProjectionEntityExpression) {
            return this.getSelectQueryString(entity.subSelect, param) + " AS " + this.enclose(entity.alias);
        }
        else if (entity instanceof RawEntityExpression) {
            return "(" + this.newLine(+1) + entity.definingQuery + this.newLine(-1) + ") AS " + this.enclose(entity.alias);
        }
        return this.entityName(entity) + (entity.alias ? " AS " + this.enclose(entity.alias) : "");
    }
    getInsertIntoQuery(insertIntoExp, option) {
        const result = [];
        const param = {
            queryExpression: insertIntoExp,
            option: option
        };
        const selectString = this.getSelectQueryString(insertIntoExp.select, param, true);
        const columns = insertIntoExp.columns.select((o) => this.enclose(o.columnName)).toArray().join(",");
        const selectQuery = `INSERT INTO ${this.entityName(insertIntoExp.entity)} (${columns})` + this.newLine() + selectString;
        result.push({
            query: selectQuery,
            type: QueryType.DML,
            parameterTree: insertIntoExp.parameterTree
        });
        return result;
    }
    getInsertQuery(insertExp, option) {
        if (insertExp.values.length <= 0) {
            return [];
        }
        const param = {
            queryExpression: insertExp,
            option: option
        };
        const colString = insertExp.columns.select((o) => this.enclose(o.columnName)).reduce("", (acc, item) => acc ? acc + "," + item : item);
        const insertQuery = `INSERT INTO ${this.entityName(insertExp.entity, param)}(${colString}) VALUES`;
        let queryTemplate = {
            query: insertQuery,
            type: QueryType.DML,
            parameterTree: insertExp.parameterTree
        };
        const result = [queryTemplate];
        let count = 0;
        this.indent++;
        for (const itemExp of insertExp.values) {
            const isLimitExceed = this.queryLimit.maxParameters && (count + insertExp.columns.length) > this.queryLimit.maxParameters;
            if (isLimitExceed) {
                queryTemplate.query = queryTemplate.query.slice(0, -1);
                queryTemplate = {
                    query: insertQuery,
                    type: QueryType.DML,
                    parameterTree: insertExp.parameterTree
                };
                count = 0;
                result.push(queryTemplate);
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
            queryTemplate.query += `${this.newLine()}(${values.join(",")}),`;
        }
        this.indent--;
        queryTemplate.query = queryTemplate.query.slice(0, -1);
        return result;
    }
    entityName(entityExp, param) {
        return this.enclose(entityExp.name);
    }
    getJoinQueryString(joins, param) {
        let result = "";
        if (joins.any()) {
            result += this.newLine();
            result += joins.select((o) => {
                const childString = this.isSimpleSelect(o.child) ? this.getEntityQueryString(o.child.entity, param)
                    : "(" + this.newLine(1) + this.getSelectQueryString(o.child, param, true) + this.newLine(-1) + ") AS " + this.enclose(o.child.entity.alias);
                let joinStr = `${o.type} JOIN ${childString}`;
                if (o.relation) {
                    const joinString = this.toString(o.relation, param);
                    joinStr += this.newLine(1, false) + `ON ${joinString}`;
                }
                return joinStr;
            }).toArray().join(this.newLine());
        }
        return result;
    }
    getPagingQueryString(select, take, skip) {
        let result = "";
        if (take) {
            result += "LIMIT " + this.toString(take) + " ";
        }
        result += "OFFSET " + this.toString(skip);
        return result;
    }
    getParentJoinQueryString(parentRel, param) {
        if (!(parentRel instanceof IncludeRelation)) {
            return "";
        }
        let parent = parentRel.parent;
        while (parent.parentRelation && parent.parentRelation.isEmbedded) {
            parent = parent.parentRelation.parent;
        }
        const entityString = this.isSimpleSelect(parent) ? this.getEntityQueryString(parent.entity, param) : `(${this.newLine(1)}${this.getSelectQueryString(parent, param, true)}${this.newLine(-1)}) AS ${this.enclose(parent.entity.alias)}`;
        const relationString = this.toLogicalString(parentRel.relation, param);
        return this.newLine() + `INNER JOIN ${entityString} ON ${relationString}`;
    }
    getSelectQuery(selectExp, option, skipInclude = false) {
        const result = [];
        const param = {
            queryExpression: selectExp,
            option: option
        };
        // subselect should not have include
        if (selectExp.isSubSelect) {
            skipInclude = true;
        }
        const take = selectExp.paging.take;
        const skip = selectExp.paging.skip;
        if (take)
            take.isReplacer = true;
        if (skip)
            skip.isReplacer = true;
        const distinct = selectExp.distinct ? " DISTINCT" : "";
        const top = !skip && take ? " TOP " + this.toString(take) : "";
        const selects = selectExp.projectedColumns
            .select((o) => {
            let colStr = "";
            if (o instanceof ComputedColumnExpression) {
                colStr = this.toOperandString(o.expression, param);
            }
            else {
                colStr = this.enclose(o.entity.alias) + "." + this.enclose(o.columnName);
            }
            // NOTE: computed column should always has alias
            if (o.alias) {
                colStr += " AS " + this.enclose(o.alias);
            }
            return colStr;
        })
            .toArray()
            .join("," + this.newLine(1, false));
        const entityQ = this.getEntityQueryString(selectExp.entity, param);
        if (selectExp instanceof GroupByExpression && !selectExp.isAggregate && selectExp.having && !selectExp.joins.ofType(HavingJoinRelation).any()) {
            const clone = selectExp.clone();
            clone.entity.alias = "rel_" + clone.entity.alias;
            clone.isAggregate = true;
            clone.distinct = true;
            clone.selects = clone.resolvedGroupBy.slice();
            let relation;
            for (const col of selectExp.resolvedGroupBy) {
                const cloneCol = clone.resolvedGroupBy.first((o) => o.dataPropertyName === col.dataPropertyName);
                const logicalExp = new StrictEqualExpression(col, cloneCol);
                relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
            }
            const joinRel = clone.parentRelation = new JoinRelation(selectExp, clone, relation, "INNER");
            selectExp.joins.push(joinRel);
        }
        const joinStr = this.getJoinQueryString(selectExp.resolvedJoins, param) + this.getParentJoinQueryString(selectExp.parentRelation, param);
        let selectQuerySuffix = "";
        if (selectExp.where) {
            param.state = "column-declared";
            selectQuerySuffix += this.newLine() + "WHERE " + this.toLogicalString(selectExp.where, param);
            param.state = "";
        }
        if (selectExp instanceof GroupByExpression && selectExp.isAggregate) {
            if (selectExp.groupBy.length > 0) {
                selectQuerySuffix += this.newLine() + "GROUP BY " + selectExp.resolvedGroupBy.select((o) => this.getColumnQueryString(o, param)).toArray().join(", ");
            }
            if (selectExp.having) {
                selectQuerySuffix += this.newLine() + "HAVING " + this.toLogicalString(selectExp.having, param);
            }
        }
        if (selectExp.orders.length > 0 && (skip || take || !(selectExp.parentRelation instanceof JoinRelation))) {
            selectQuerySuffix += this.newLine() + "ORDER BY " + selectExp.orders.select((c) => this.toString(c.column, param) + " " + c.direction).toArray().join(", ");
        }
        if (skip) {
            selectQuerySuffix += this.newLine() + this.getPagingQueryString(selectExp, take, skip);
        }
        const selectQuery = `SELECT${distinct}${top} ${selects}`
            + this.newLine() + `FROM ${entityQ}${joinStr}${selectQuerySuffix}`;
        // select include before parent, coz result parser will parse include first before parent.
        // this way it will be much more easier to implement async iterator.
        const queryTemplate = {
            query: selectQuery,
            type: QueryType.DQL,
            parameterTree: selectExp.parameterTree
        };
        result.push(queryTemplate);
        if (!skipInclude) {
            // select each include as separated query as it more beneficial for performance
            for (const include of selectExp.resolvedIncludes) {
                let child = include.child;
                if (include.isManyToManyRelation) {
                    // create relation data (clone select join clone child)
                    selectExp.includes.delete(include);
                    const cloneEntity = selectExp.entity.clone();
                    cloneEntity.isRelationData = true;
                    const relationData = new SelectExpression(cloneEntity);
                    cloneEntity.alias = "rel_" + cloneEntity.alias;
                    const childSelect = include.child;
                    const joinChildSelect = childSelect.clone();
                    joinChildSelect.entity.alias = "rel_" + joinChildSelect.entity.alias;
                    const relDataCloneMap = new Map();
                    mapReplaceExp(relDataCloneMap, childSelect, joinChildSelect);
                    mapReplaceExp(relDataCloneMap, selectExp, relationData);
                    relationData.includes = [];
                    relationData.addJoin(joinChildSelect, include.relation.clone(relDataCloneMap), "INNER");
                    relationData.selects = [];
                    relationData.itemExpression = new ObjectValueExpression({});
                    relationData.distinct = true;
                    // Bridge to Child relation
                    let bridgeChildRelation;
                    for (const childCol of childSelect.primaryKeys) {
                        const bridgeCol = relationData.allColumns.first((o) => o.columnName === childCol.columnName);
                        relationData.selects.push(bridgeCol);
                        const logicalExp = new StrictEqualExpression(bridgeCol, childCol);
                        bridgeChildRelation = bridgeChildRelation ? new AndExpression(bridgeChildRelation, logicalExp) : logicalExp;
                    }
                    relationData.addInclude(include.name, childSelect, bridgeChildRelation, "one");
                    // Parent to Bridge relation
                    let parentBridgeRelation;
                    const cloneMap = new Map();
                    mapReplaceExp(cloneMap, selectExp.entity, relationData.entity);
                    for (const parentCol of selectExp.primaryKeys) {
                        let bridgeCol = relationData.allColumns.first((o) => o.columnName === parentCol.columnName);
                        if (!bridgeCol) {
                            bridgeCol = parentCol.clone(cloneMap);
                        }
                        relationData.selects.push(bridgeCol);
                        const logicalExp = new StrictEqualExpression(parentCol, bridgeCol);
                        parentBridgeRelation = parentBridgeRelation ? new AndExpression(parentBridgeRelation, logicalExp) : logicalExp;
                    }
                    selectExp.addInclude(include.name, relationData, parentBridgeRelation, "many");
                    child = relationData;
                }
                const templates = this.getSelectQuery(child, param.option);
                for (const temp of templates) {
                    temp.parameterTree = mergeTree(temp.parameterTree, queryTemplate.parameterTree);
                    result.push(temp);
                }
            }
        }
        return result;
    }
    getSelectQueryString(select, param, skipInclude = false) {
        let result = "";
        result += this.getSelectQuery(select, param.option, skipInclude).select((o) => o.query).toArray().join(";" + this.newLine() + this.newLine());
        return result;
    }
    // TODO: Update Query should use ANSI SQL Standard
    getUpdateQuery(updateExp, option) {
        const result = [];
        const param = {
            queryExpression: updateExp,
            option: option
        };
        const setQuery = Object.keys(updateExp.setter).select((o) => {
            const value = updateExp.setter[o];
            const valueStr = this.toOperandString(value, param);
            const column = updateExp.entity.columns.first((c) => c.propertyName === o);
            return `${this.enclose(column.columnName)} = ${valueStr}`;
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
                const valueExp = new AdditionExpression(updateExp.entity.versionColumn, new ValueExpression(1));
                const valueStr = this.toString(valueExp, param);
                setQuery.push(`${this.enclose(updateExp.entity.alias)}.${this.enclose(colMeta.columnName)} = ${valueStr}`);
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
            type: QueryType.DML,
            parameterTree: updateExp.parameterTree
        });
        return result;
    }
    getUpsertQuery(upsertExp, option) {
        const pkValues = [];
        const joinString = [];
        const param = {
            queryExpression: upsertExp,
            option: option
        };
        for (const o of upsertExp.entity.primaryColumns) {
            const valueExp = upsertExp.value[o.propertyName];
            pkValues.push(`${this.toString(valueExp, param)} AS ${this.enclose(o.columnName)}`);
            joinString.push(`_VAL.${this.enclose(o.columnName)} = ${this.getColumnQueryString(o, param)}`);
        }
        let upsertQuery = `MERGE INTO ${this.getEntityQueryString(upsertExp.entity, param)}` + this.newLine() +
            `USING (SELECT ${pkValues.join(", ")}) AS _VAL ON ${joinString.join(" AND ")}` + this.newLine() +
            `WHEN MATCHED THEN` + this.newLine(1);
        const updateString = upsertExp.updateColumns.select((column) => {
            const value = upsertExp.value[column.propertyName];
            if (!value) {
                return null;
            }
            return `${this.enclose(column.columnName)} = ${this.toOperandString(value, param)}`;
        }).where((o) => !!o).toArray().join(`,${this.newLine(1, false)}`);
        upsertQuery += `UPDATE SET ${updateString}` + this.newLine(-1) +
            `WHEN NOT MATCHED THEN` + this.newLine(1);
        const colString = upsertExp.insertColumns.select((o) => this.enclose(o.columnName)).toArray().join(",");
        const insertQuery = `INSERT (${colString})` + this.newLine() +
            `VALUES (${upsertExp.insertColumns.select((o) => {
                const valueExp = upsertExp.value[o.propertyName];
                return valueExp ? this.toString(valueExp, param) : "DEFAULT";
            }).toArray().join(",")})`;
        upsertQuery += insertQuery;
        this.indent--;
        const results = [{
                query: upsertQuery,
                type: QueryType.DML,
                parameterTree: upsertExp.parameterTree
            }];
        return results;
    }
    identifierString(value) {
        return this.stringString(value.toString());
    }
    isSimpleSelect(exp) {
        return !(exp instanceof GroupByExpression) && !exp.where && exp.joins.length === 0
            && (!exp.parentRelation || exp.parentRelation instanceof JoinRelation && exp.parentRelation.childColumns.all((c) => exp.entity.columns.contains(c)))
            && !exp.paging.skip && !exp.paging.take
            && exp.selects.all((c) => !c.alias);
    }
    nullString() {
        return "NULL";
    }
    numberString(value) {
        return value.toString();
    }
    stringString(value) {
        return "'" + value.replace(/'/ig, "''") + "'";
    }
    timeString(value) {
        return this.stringString(toTimeString(value));
    }
    //#endregion
    //#region IExpression
    toArrayString(expression, param) {
        const itemStr = expression.items.select((o) => this.toOperandString(o, param)).toArray().join(", ");
        return `(${itemStr})`;
    }
    toFunctionCallString(expression, param) {
        const fn = ExpressionExecutor.execute(expression.fnExpression);
        const transformer = this.resolveTranslator(fn);
        if (transformer) {
            return transformer.translate(this, expression, param);
        }
        throw new Error(`function "${expression.functionName}" not suported`);
    }
    toInstantiationString(expression, param) {
        const translator = this.resolveTranslator(expression.type);
        if (!translator) {
            try {
                const value = ExpressionExecutor.execute(expression);
                return this.valueString(value);
            }
            catch (e) {
                throw new Error(`instantiate "${expression.type.name}" not supported`);
            }
        }
        return translator.translate(this, expression, param);
    }
    toMemberAccessString(exp, param) {
        let translater;
        if (exp.objectOperand.type === Object && exp.objectOperand instanceof ValueExpression) {
            translater = this.resolveTranslator(exp.objectOperand.value, exp.memberName);
        }
        if (!translater && exp.objectOperand.type) {
            translater = this.resolveTranslator(exp.objectOperand.type.prototype, exp.memberName);
        }
        if (translater) {
            return translater.translate(this, exp, param);
        }
        throw new Error(`${exp.memberName} not supported.`);
    }
    toMethodCallString(exp, param) {
        let translator;
        if (exp.objectOperand instanceof SelectExpression) {
            translator = this.resolveTranslator(SelectExpression.prototype, exp.methodName);
        }
        else if ( /* exp.objectOperand instanceof SqlParameterExpression ||*/exp.objectOperand instanceof ParameterExpression || exp.objectOperand instanceof ValueExpression) {
            const value = this.extractValue(exp.objectOperand, param);
            translator = this.resolveTranslator(value, exp.methodName);
        }
        if (!translator) {
            translator = this.resolveTranslator(exp.objectOperand.type.prototype, exp.methodName);
        }
        if (translator) {
            return translator.translate(this, exp, param);
        }
        throw new Error(`${exp.objectOperand.type.name}.${exp.methodName} not supported in linq to sql.`);
    }
    toOperatorString(expression, param) {
        const translator = this.resolveTranslator(expression.constructor);
        if (!translator) {
            throw new Error(`operator "${expression.constructor.name}" not supported`);
        }
        return translator.translate(this, expression, param);
    }
    toRawSqlString(expression) {
        return expression.sqlStatement;
    }
    toSqlParameterString(expression, param) {
        if (expression.isReplacer) {
            return "${" + expression.name + "}";
        }
        return "@" + expression.name;
    }
    toValueString(expression) {
        if (expression.value === undefined && expression.expressionString) {
            return expression.expressionString;
        }
        return this.valueString(expression.value);
    }
}
const mergeTree = (tree1, tree2) => {
    const result = {
        childrens: [],
        node: []
    };
    const list = [[result, tree1, tree2]];
    while (list.any()) {
        const a = list.shift();
        a[0].node = [].concat(a[1] ? a[1].node : []).concat(a[2] ? a[2].node : []);
        for (let i = 0, len = Math.max(a[1] ? a[1].childrens.length : 0, a[2] ? a[2].childrens.length : 0); i < len; ++i) {
            const child1 = a[1] ? a[1].childrens[i] : null;
            const child2 = a[2] ? a[2].childrens[i] : null;
            const cresult = {
                childrens: [],
                node: []
            };
            a[0].childrens.push(cresult);
            list.push([cresult, child1, child2]);
        }
    }
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFF1ZXJ5QnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Qcm92aWRlci9SZWxhdGlvbmFsL1JlbGF0aW9uYWxRdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSTlDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNqRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFHbkcsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFFckcsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDbkcsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFFLHFCQUFxQixFQUFF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