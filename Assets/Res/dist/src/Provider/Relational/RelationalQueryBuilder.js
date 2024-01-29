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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFF1ZXJ5QnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1Byb3ZpZGVyL1JlbGF0aW9uYWwvUmVsYXRpb25hbFF1ZXJ5QnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJOUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWpELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFN0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUduRyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw0REFBNEQsQ0FBQztBQUVyRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUNuRyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMvRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUUscUJBQXFCLEVBQUUs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