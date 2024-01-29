import { ParameterStack } from "../../Common/ParameterStack";
import { columnMetaKey, relationMetaKey } from "../../Decorator/DecoratorKey";
import { AdditionExpression } from "../../ExpressionBuilder/Expression/AdditionExpression";
import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { ArrayValueExpression } from "../../ExpressionBuilder/Expression/ArrayValueExpression";
import { FunctionCallExpression } from "../../ExpressionBuilder/Expression/FunctionCallExpression";
import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { GreaterEqualExpression } from "../../ExpressionBuilder/Expression/GreaterEqualExpression";
import { GreaterThanExpression } from "../../ExpressionBuilder/Expression/GreaterThanExpression";
import { InstantiationExpression } from "../../ExpressionBuilder/Expression/InstantiationExpression";
import { LessEqualExpression } from "../../ExpressionBuilder/Expression/LessEqualExpression";
import { LessThanExpression } from "../../ExpressionBuilder/Expression/LessThanExpression";
import { MemberAccessExpression } from "../../ExpressionBuilder/Expression/MemberAccessExpression";
import { MethodCallExpression } from "../../ExpressionBuilder/Expression/MethodCallExpression";
import { NotExpression } from "../../ExpressionBuilder/Expression/NotExpression";
import { ObjectValueExpression } from "../../ExpressionBuilder/Expression/ObjectValueExpression";
import { OrExpression } from "../../ExpressionBuilder/Expression/OrExpression";
import { ParameterExpression } from "../../ExpressionBuilder/Expression/ParameterExpression";
import { SpreadExpression } from "../../ExpressionBuilder/Expression/SpreadExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { StrictNotEqualExpression } from "../../ExpressionBuilder/Expression/StrictNotEqualExpression";
import { SubstractionExpression } from "../../ExpressionBuilder/Expression/SubstractionExpression";
import { TernaryExpression } from "../../ExpressionBuilder/Expression/TernaryExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { ExpressionExecutor } from "../../ExpressionBuilder/ExpressionExecutor";
import { toObjectFunctionExpression } from "../../Helper/ExpressionUtil";
import { isColumnExp, isEntityExp, isExpression, isNativeFunction, isNull, isValue, isValueType, mapKeepExp, mapReplaceExp, resolveClone } from "../../Helper/Util";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { ComputedColumnMetaData } from "../../MetaData/ComputedColumnMetaData";
import { EmbeddedRelationMetaData } from "../../MetaData/EmbeddedColumnMetaData";
import { TempEntityMetaData } from "../../MetaData/TempEntityMetaData";
import { JoinRelation } from "../../Queryable/Interface/JoinRelation";
import { PagingJoinRelation } from "../../Queryable/Interface/PagingJoinRelation";
import { Queryable } from "../../Queryable/Queryable";
import { ColumnExpression } from "../../Queryable/QueryExpression/ColumnExpression";
import { ComputedColumnExpression } from "../../Queryable/QueryExpression/ComputedColumnExpression";
import { EntityExpression } from "../../Queryable/QueryExpression/EntityExpression";
import { ExceptExpression } from "../../Queryable/QueryExpression/ExceptExpression";
import { GroupByExpression } from "../../Queryable/QueryExpression/GroupByExpression";
import { GroupedExpression } from "../../Queryable/QueryExpression/GroupedExpression";
import { IntersectExpression } from "../../Queryable/QueryExpression/IntersectExpression";
import { SelectExpression } from "../../Queryable/QueryExpression/SelectExpression";
import { SqlParameterExpression } from "../../Queryable/QueryExpression/SqlParameterExpression";
import { UnionExpression } from "../../Queryable/QueryExpression/UnionExpression";
export class RelationalQueryVisitor {
    constructor() {
        this.aliasObj = {};
        this.queryOption = {};
        this.valueTransformer = new ExpressionExecutor();
    }
    get stack() {
        return this.valueTransformer.stack;
    }
    set stack(v) {
        v = v ? v.clone() : new ParameterStack();
        this.valueTransformer.stack = v;
    }
    newAlias(type = "entity") {
        if (!this.aliasObj[type]) {
            this.aliasObj[type] = 0;
        }
        return this.namingStrategy.getAlias(type) + this.aliasObj[type]++;
    }
    setDefaultBehaviour(selectExp) {
        const entityExp = selectExp.entity;
        if (entityExp.deleteColumn && !this.queryOption.includeSoftDeleted) {
            selectExp.addWhere(new StrictEqualExpression(entityExp.deleteColumn, new ValueExpression(false)));
        }
        if (selectExp.orders.length <= 0 && entityExp.defaultOrders.length > 0) {
            const orderParams = entityExp.defaultOrders
                .select((o) => new ArrayValueExpression(o[0], new ValueExpression(o[1] || "ASC")))
                .toArray();
            this.visit(new MethodCallExpression(selectExp, "orderBy", orderParams), { selectExpression: selectExp, scope: "orderBy" });
        }
    }
    //#region visit parameter
    visit(exp, param) {
        // TODO: ultimate goal is to remove clone as much as possible.
        switch (exp.constructor) {
            case MethodCallExpression:
            case MemberAccessExpression: {
                const memberExpression = exp;
                memberExpression.objectOperand = this.visit(memberExpression.objectOperand, param);
                if (memberExpression.objectOperand instanceof TernaryExpression) {
                    const ternaryExp = memberExpression.objectOperand;
                    const trueOperand = memberExpression;
                    trueOperand.objectOperand = ternaryExp.trueOperand;
                    const falseOperand = memberExpression;
                    falseOperand.objectOperand = ternaryExp.falseOperand;
                    return new TernaryExpression(ternaryExp.logicalOperand, this.visit(trueOperand, param), this.visit(falseOperand, param));
                }
                return exp instanceof MemberAccessExpression ? this.visitMember(exp, param) : this.visitMethod(exp, param);
            }
            case FunctionCallExpression:
                return this.visitFunctionCall(exp, param);
            case InstantiationExpression:
                return this.visitInstantiation(exp, param);
            case TernaryExpression:
                return this.visitTernaryOperator(exp, param);
            case ObjectValueExpression:
                return this.visitObjectLiteral(exp, param);
            case ArrayValueExpression:
                throw new Error(`literal Array not supported`);
            case FunctionExpression:
                return this.visitFunction(exp, [], param);
            case ParameterExpression:
                return this.visitParameter(exp, param);
            case SpreadExpression:
                throw new Error("Spread expression not supported");
            default: {
                if (exp.leftOperand) {
                    return this.visitBinaryOperator(exp, param);
                }
                else if (exp.operand) {
                    return this.visitUnaryOperator(exp, param);
                }
            }
        }
        return exp;
    }
    visitFunction(exp, parameters, param) {
        let i = 0;
        for (const paramExp of exp.params) {
            this.stack.push(paramExp.name, parameters[i++]);
        }
        const result = this.visit(exp.body, param);
        for (const paramExp of exp.params) {
            this.stack.pop(paramExp.name);
        }
        return result;
    }
    isSafe(exp) {
        if (exp instanceof SqlParameterExpression) {
            return true;
        }
        return exp instanceof ValueExpression;
    }
    visitBinaryOperator(exp, param) {
        exp.leftOperand = this.visit(exp.leftOperand, param);
        exp.rightOperand = this.visit(exp.rightOperand, param);
        const isExpressionSafe = this.isSafe(exp.leftOperand) && this.isSafe(exp.rightOperand);
        if (isExpressionSafe) {
            let hasParam = false;
            if (exp.leftOperand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.leftOperand);
                exp.leftOperand = exp.leftOperand.valueExp;
                hasParam = true;
            }
            if (exp.rightOperand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.rightOperand);
                exp.rightOperand = exp.rightOperand.valueExp;
                hasParam = true;
            }
            if (hasParam) {
                return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
            }
            return new ValueExpression(this.valueTransformer.execute(exp));
        }
        if (exp.leftOperand instanceof TernaryExpression) {
            const ternaryExp = exp.leftOperand;
            const falseOperand = exp.clone();
            falseOperand.leftOperand = ternaryExp.falseOperand;
            const trueOperand = exp.clone();
            trueOperand.leftOperand = ternaryExp.trueOperand;
            return new TernaryExpression(ternaryExp.logicalOperand, this.visit(trueOperand, param), this.visit(falseOperand, param));
        }
        else if (exp.rightOperand instanceof TernaryExpression) {
            const ternaryExp = exp.rightOperand;
            const falseOperand = exp.clone();
            falseOperand.rightOperand = ternaryExp.falseOperand;
            const trueOperand = exp.clone();
            trueOperand.rightOperand = ternaryExp.trueOperand;
            return new TernaryExpression(ternaryExp.logicalOperand, this.visit(trueOperand, param), this.visit(falseOperand, param));
        }
        return exp;
    }
    visitFunctionCall(exp, param) {
        exp.fnExpression = this.visit(exp.fnExpression, param);
        if (!(exp.fnExpression instanceof ValueExpression)) {
            throw new Error("Function call expect a function");
        }
        exp.params = exp.params.select((o) => this.visit(o, param)).toArray();
        const fn = exp.fnExpression.value;
        const isExpressionSafe = exp.params.all((o) => this.isSafe(o));
        const translator = this.translator.resolve(fn);
        if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
            return exp;
        }
        // Execute function in application if all it's parameters available in application.
        if (isExpressionSafe) {
            let hasParam = false;
            exp.params = exp.params.select((o) => {
                if (o instanceof SqlParameterExpression) {
                    param.selectExpression.parameterTree.node.delete(o);
                    hasParam = true;
                    return o.valueExp;
                }
                return o;
            }).toArray();
            if (hasParam) {
                param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
            }
            return new ValueExpression(this.valueTransformer.execute(exp));
        }
        // Try convert function as Expression
        if (!isNativeFunction(fn)) {
            const functionExp = ExpressionBuilder.parse(fn);
            const result = this.visitFunction(functionExp, exp.params, { selectExpression: param.selectExpression });
            return result;
        }
        return exp;
    }
    visitInstantiation(exp, param) {
        exp.typeOperand = this.visit(exp.typeOperand, param);
        exp.params = exp.params.select((o) => this.visit(o, param)).toArray();
        const isExpressionSafe = this.isSafe(exp.typeOperand) && exp.params.all((o) => this.isSafe(o));
        const translator = this.translator.resolve(exp.typeOperand.value);
        if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
            return exp;
        }
        if (isExpressionSafe) {
            exp.params = exp.params.select((o) => {
                if (o instanceof SqlParameterExpression) {
                    param.selectExpression.parameterTree.node.delete(o);
                    return o.valueExp;
                }
                return o;
            }).toArray();
            const result = param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
            return result;
        }
        throw new Error(`${exp.type.name} not supported.`);
    }
    visitMember(exp, param) {
        const objectOperand = exp.objectOperand;
        if (exp.memberName === "prototype" || exp.memberName === "__proto__") {
            throw new Error(`property ${exp.memberName} not supported in linq to sql.`);
        }
        if (isEntityExp(objectOperand)) {
            let column = objectOperand.columns.first((c) => c.propertyName === exp.memberName);
            if (!column && objectOperand instanceof EntityExpression) {
                const computedColumnMeta = Reflect.getOwnMetadata(columnMetaKey, objectOperand.type, exp.memberName);
                if (computedColumnMeta instanceof ComputedColumnMetaData) {
                    const result = this.visitFunction(computedColumnMeta.functionExpression.clone(), [objectOperand], { selectExpression: param.selectExpression });
                    if (result instanceof EntityExpression || result instanceof SelectExpression) {
                        throw new Error(`${objectOperand.type.name}.${exp.memberName} not supported`);
                    }
                    column = new ComputedColumnExpression(objectOperand, result, exp.memberName);
                }
            }
            if (column) {
                if (param.scope === "project" && objectOperand.select) {
                    objectOperand.select.selects.add(column);
                }
                return column;
            }
            if (objectOperand.select) {
                const selectExp = objectOperand.select;
                const colExp = selectExp.selects.first((c) => c.propertyName === exp.memberName);
                if (colExp) {
                    return colExp;
                }
                const include = selectExp.includes.first((c) => c.name === exp.memberName);
                if (include) {
                    const replaceMap = new Map();
                    const child = include.child.clone(replaceMap);
                    mapReplaceExp(replaceMap, selectExp.entity, objectOperand);
                    const relation = include.relation.clone(replaceMap);
                    switch (param.scope) {
                        case "project":
                        case "include": {
                            selectExp.addInclude(include.name, child, relation, include.type, include.isEmbedded);
                            return include.type === "many" ? child : child.entity;
                        }
                        default:
                            {
                                let joinType = "LEFT";
                                if (include.type === "one" && param.scope === "where") {
                                    joinType = "INNER";
                                }
                                selectExp.addJoin(child, relation, joinType, include.isEmbedded);
                                return include.type === "many" ? child : child.entity;
                            }
                    }
                }
            }
            const relationMeta = Reflect.getOwnMetadata(relationMetaKey, objectOperand.type, exp.memberName);
            if (relationMeta) {
                const targetType = relationMeta.target.type;
                const entityExp = new EntityExpression(targetType, this.newAlias());
                if (relationMeta instanceof EmbeddedRelationMetaData) {
                    for (const col of entityExp.columns) {
                        col.columnName = relationMeta.prefix + col.columnName;
                    }
                    entityExp.name = objectOperand.name;
                }
                switch (param.scope) {
                    case "project":
                    case "include": {
                        const child = new SelectExpression(entityExp);
                        this.setDefaultBehaviour(child);
                        objectOperand.select.addInclude(exp.memberName, child, relationMeta);
                        return relationMeta.relationType === "many" ? child : child.entity;
                    }
                    default: {
                        const child = new SelectExpression(entityExp);
                        this.setDefaultBehaviour(child);
                        const relJoin = objectOperand.select.addJoin(child, relationMeta);
                        if (!(param.selectExpression instanceof GroupByExpression) && !(param.selectExpression instanceof GroupedExpression)) {
                            param.selectExpression.joins.push(relJoin);
                            objectOperand.select.joins.pop();
                            relJoin.parent = param.selectExpression;
                        }
                        if (relationMeta.relationType === "many") {
                            child.parameterTree = objectOperand.select.parameterTree;
                            return child;
                        }
                        return child.entity;
                    }
                }
            }
        }
        else if (objectOperand instanceof SelectExpression && exp.memberName === "length") {
            return this.visit(new MethodCallExpression(objectOperand, "count", []), param);
        }
        else if (objectOperand instanceof GroupedExpression) {
            if (exp.memberName === "key") {
                const result = objectOperand.key;
                if (isEntityExp(result)) {
                    switch (param.scope) {
                        case "project":
                        case "include":
                        case "select-object": {
                            return result;
                        }
                        default: {
                            const includeRel = objectOperand.groupByExp.keyRelation;
                            const replaceMap = new Map();
                            mapKeepExp(replaceMap, result);
                            const childExp = result.select.clone(replaceMap);
                            mapReplaceExp(replaceMap, objectOperand.groupByExp, objectOperand);
                            objectOperand.addJoin(childExp, includeRel.relation.clone(replaceMap), "INNER", includeRel.isEmbedded);
                            return childExp.entity;
                        }
                    }
                }
                return result;
            }
        }
        else if (objectOperand instanceof SqlParameterExpression) {
            param.selectExpression.parameterTree.node.delete(objectOperand);
            exp.objectOperand = objectOperand.valueExp;
            return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
        }
        else {
            let translator;
            const isExpressionSafe = this.isSafe(objectOperand);
            if (objectOperand instanceof ValueExpression) {
                translator = this.translator.resolve(objectOperand.value, exp.memberName);
                if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
                    return exp;
                }
            }
            if (!translator && objectOperand.type) {
                translator = this.translator.resolve(objectOperand.type.prototype, exp.memberName);
                if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
                    return exp;
                }
            }
            // Execute in app if all parameter is available.
            if (isExpressionSafe) {
                if (exp.objectOperand instanceof SqlParameterExpression) {
                    param.selectExpression.parameterTree.node.delete(exp.objectOperand);
                    exp.objectOperand = exp.objectOperand.valueExp;
                    return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
                }
                return new ValueExpression(this.valueTransformer.execute(exp));
            }
        }
        throw new Error(`${objectOperand.type.name}.${exp.memberName} is invalid or not supported in linq to sql.`);
    }
    visitMethod(exp, param) {
        const objectOperand = exp.objectOperand;
        if (objectOperand instanceof SelectExpression) {
            let selectOperand = objectOperand;
            switch (exp.methodName) {
                case "groupBy": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const parentRelation = objectOperand.parentRelation;
                    const selectorFn = exp.params[0];
                    const visitParam = { selectExpression: selectOperand, scope: exp.methodName };
                    const selectExp = this.visitFunction(selectorFn, [selectOperand.getItemExpression()], visitParam);
                    param.selectExpression = visitParam.selectExpression;
                    if (selectExp instanceof SelectExpression) {
                        throw new Error(`groupBy did not support selector which return array/queryable/enumerable.`);
                    }
                    let key = selectExp;
                    if (isEntityExp(selectExp)) {
                        const childSelectExp = selectExp.select;
                        if (childSelectExp === selectOperand) {
                            throw new Error(`groupBy did not support selector which return itselft.`);
                        }
                        reverseJoin(childSelectExp, selectOperand, true);
                        // remove relation to groupBy expression.
                        const parentRel = childSelectExp.parentRelation;
                        parentRel.parent.joins.delete(parentRel);
                    }
                    else if (isColumnExp(selectExp)) {
                        key = selectExp;
                    }
                    else {
                        const column = new ComputedColumnExpression(selectOperand.entity, selectExp, "key");
                        column.alias = this.newAlias("column");
                        key = column;
                    }
                    const groupByExp = new GroupByExpression(selectOperand, key);
                    if (parentRelation) {
                        parentRelation.child = groupByExp;
                        groupByExp.parentRelation = parentRelation;
                    }
                    else {
                        param.selectExpression = groupByExp;
                    }
                    return groupByExp;
                }
                case "select":
                case "selectMany": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const cloneObjectOperand = selectOperand instanceof GroupedExpression && param.scope !== "selectMany" && param.scope !== "select" && param.scope !== "queryable";
                    const oriJoinCount = selectOperand.joins.length;
                    const selectorParam = (exp.params.length > 1 ? exp.params[1] : exp.params[0]);
                    let selectorFn;
                    if (selectorParam instanceof FunctionExpression) {
                        selectorFn = selectorParam;
                    }
                    else if (selectorParam instanceof ObjectValueExpression) {
                        selectorFn = toObjectFunctionExpression(selectorParam.object, selectOperand.itemType, "o", this.stack);
                    }
                    const visitParam = { selectExpression: selectOperand, scope: exp.methodName };
                    let selectExp = this.visitFunction(selectorFn, [selectOperand.getItemExpression()], visitParam);
                    if (selectExp !== selectOperand.getItemExpression()) {
                        if (selectOperand instanceof GroupByExpression) {
                            selectOperand.isAggregate = true;
                        }
                        if (exp.methodName === "select") {
                            if (selectExp instanceof SelectExpression) {
                                // group result by relation to parent.
                                reverseJoin(selectExp, selectOperand, cloneObjectOperand);
                                const objExp = new ObjectValueExpression({});
                                const paramExp = new ParameterExpression("o", selectExp.itemType);
                                for (const relCol of selectOperand.parentRelation.parentColumns) {
                                    objExp.object[relCol.propertyName] = relCol;
                                }
                                const fnExp = new FunctionExpression(objExp, [paramExp]);
                                const groupByMethodExp = new MethodCallExpression(selectExp, "groupBy", [fnExp]);
                                const groupByExp = this.visit(groupByMethodExp, param);
                                selectOperand = groupByExp;
                            }
                            else if (isEntityExp(selectExp)) {
                                const childExp = selectExp.select;
                                // if child select did not have parent relation, that means that
                                // child select is replacement for current param.selectExpression
                                if (!childExp.parentRelation && selectOperand.parentRelation) {
                                    const parentRel = selectOperand.parentRelation;
                                    childExp.parentRelation = parentRel;
                                    parentRel.child = childExp;
                                    const replaceMap = new Map([[selectOperand, childExp]]);
                                    for (const col of selectOperand.relationColumns) {
                                        const projectCol = childExp.entity.columns.first((o) => o.columnName === col.columnName);
                                        replaceMap.set(col, projectCol);
                                    }
                                    mapKeepExp(replaceMap, parentRel.parent);
                                    parentRel.relation = parentRel.relation.clone(replaceMap);
                                    selectOperand = childExp;
                                }
                                else {
                                    // return child select and add current select expression as a join relation.
                                    selectOperand = reverseJoin(childExp, selectOperand, cloneObjectOperand);
                                }
                            }
                            else {
                                // scalar value
                                if (cloneObjectOperand && selectOperand.joins.length === oriJoinCount) {
                                    const entityExp = selectOperand.entity.clone();
                                    entityExp.alias = this.newAlias();
                                    const cloneSelectExp = new SelectExpression(entityExp);
                                    const cloneMap = new Map();
                                    mapReplaceExp(cloneMap, selectOperand.entity, entityExp);
                                    let relations;
                                    for (const pCol of selectOperand.primaryKeys) {
                                        let embeddedCol = cloneSelectExp.allColumns.first((o) => o.propertyName === pCol.propertyName);
                                        if (!embeddedCol) {
                                            embeddedCol = pCol.clone(cloneMap);
                                        }
                                        const logicalExp = new StrictEqualExpression(pCol, embeddedCol);
                                        relations = relations ? new AndExpression(relations, logicalExp) : logicalExp;
                                    }
                                    selectOperand.addJoin(cloneSelectExp, relations, "LEFT");
                                    selectOperand = cloneSelectExp;
                                    selectExp = resolveClone(selectExp, cloneMap);
                                }
                                if (isColumnExp(selectExp)) {
                                    if (selectOperand instanceof GroupByExpression && selectOperand.key === selectExp) {
                                        selectOperand.itemExpression = selectExp;
                                        selectOperand.selects = [selectExp];
                                    }
                                    else {
                                        let colExp = selectExp;
                                        selectOperand = reverseJoin(selectExp.entity.select, selectOperand, cloneObjectOperand);
                                        if (selectExp.entity !== selectOperand.entity) {
                                            colExp = selectOperand.allColumns.first((o) => o.dataPropertyName === colExp.dataPropertyName);
                                        }
                                        selectOperand.itemExpression = colExp;
                                        selectOperand.selects = [colExp];
                                    }
                                }
                                else if (selectExp instanceof TernaryExpression) {
                                    // TODO
                                }
                                else {
                                    const column = new ComputedColumnExpression(selectOperand.entity, selectExp, this.newAlias("column"));
                                    selectOperand.itemExpression = column;
                                    selectOperand.selects = [column];
                                }
                            }
                        }
                        else {
                            if (!(selectExp instanceof SelectExpression)) {
                                throw new Error(`Queryable<${objectOperand.itemType.name}>.selectMany required selector with array or queryable or enumerable return value.`);
                            }
                            selectOperand = reverseJoin(selectExp, selectOperand, cloneObjectOperand);
                        }
                        if (!selectOperand.isSubSelect) {
                            // inherit all parameters
                            // selectOperand.parameterTree = param.selectExpression.parameterTree;
                            param.selectExpression = selectOperand;
                        }
                    }
                    const type = exp.params.length > 1 ? exp.params[0] : null;
                    if (type) {
                        selectOperand.itemExpression.type = type.value;
                    }
                    return selectOperand;
                }
                case "project":
                case "include": {
                    if (exp.methodName === "project") {
                        objectOperand.selects = [];
                    }
                    for (const paramFn of exp.params) {
                        const selectorFn = paramFn;
                        const visitParam = { selectExpression: objectOperand, scope: exp.methodName };
                        this.visitFunction(selectorFn, [objectOperand.getItemExpression()], visitParam);
                    }
                    return objectOperand;
                }
                case "where": {
                    if (param.scope === "select-object" && selectOperand instanceof GroupedExpression) {
                        const entityExp = selectOperand.entity.clone();
                        entityExp.alias = this.newAlias();
                        const selectExp = new SelectExpression(entityExp);
                        let relation;
                        for (const parentCol of selectOperand.entity.primaryColumns) {
                            const childCol = entityExp.columns.first((o) => o.columnName === parentCol.columnName);
                            const logicalExp = new StrictEqualExpression(parentCol, childCol);
                            relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                        }
                        selectOperand.addJoin(selectExp, relation, "LEFT");
                        selectOperand = selectExp;
                    }
                    const predicateFn = exp.params[0];
                    const visitParam = { selectExpression: selectOperand, scope: "where" };
                    const whereExp = this.visitFunction(predicateFn, [selectOperand.getItemExpression()], visitParam);
                    if (whereExp.type !== Boolean) {
                        throw new Error(`Queryable<${objectOperand.itemType.name}>.where required predicate with boolean return value.`);
                    }
                    selectOperand.addWhere(whereExp);
                    return selectOperand;
                }
                case "contains": {
                    // TODO: dbset1.where(o => dbset2.select(c => c.column).contains(o.column)); use inner join for this
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const item = this.visit(exp.params[0], param);
                    let andExp;
                    if (objectOperand.isSubSelect) {
                        objectOperand.distinct = true;
                        objectOperand.parentRelation.parent.joins.delete(objectOperand.parentRelation);
                        objectOperand.parentRelation = null;
                        return new MethodCallExpression(objectOperand, "contains", [item]);
                    }
                    if (objectOperand.itemType === objectOperand.entity.type) {
                        if (objectOperand.entity instanceof EntityExpression) {
                            for (const primaryCol of objectOperand.entity.primaryColumns) {
                                const d = new StrictEqualExpression(primaryCol, new MemberAccessExpression(item, primaryCol.propertyName));
                                andExp = andExp ? new AndExpression(andExp, d) : d;
                            }
                        }
                        else {
                            for (const col of objectOperand.entity.columns) {
                                const d = new StrictEqualExpression(col, new MemberAccessExpression(item, col.propertyName));
                                andExp = andExp ? new AndExpression(andExp, d) : d;
                            }
                        }
                    }
                    else {
                        andExp = new StrictEqualExpression(objectOperand.selects.first(), item);
                    }
                    objectOperand.addWhere(andExp);
                    const visitParam = { selectExpression: objectOperand, scope: param.scope };
                    return this.visit(new MethodCallExpression(selectOperand, "any", []), visitParam);
                }
                case "distinct": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    objectOperand.distinct = true;
                    return objectOperand;
                }
                case "orderBy": {
                    let pagingJoin;
                    if (param.scope !== "queryable") {
                        pagingJoin = objectOperand.joins.ofType(PagingJoinRelation).first();
                    }
                    const hasPaging = pagingJoin || objectOperand.paging.take || objectOperand.paging.skip;
                    if (hasPaging) {
                        const cloneMap = new Map();
                        const includes = selectOperand.includes;
                        selectOperand.includes = [];
                        const newSelect = selectOperand.clone(cloneMap);
                        newSelect.entity.alias = this.newAlias();
                        newSelect.selects = [];
                        selectOperand.includes = includes;
                        selectOperand.where = null;
                        let relationExp = null;
                        for (const col of selectOperand.primaryKeys) {
                            const cloneCol = resolveClone(col, cloneMap);
                            const logicalExp = new StrictEqualExpression(col, cloneCol);
                            relationExp = relationExp ? new AndExpression(relationExp, logicalExp) : logicalExp;
                        }
                        selectOperand.addJoin(newSelect, relationExp, "INNER");
                        selectOperand.paging = {};
                        if (pagingJoin) {
                            selectOperand.joins.delete(pagingJoin);
                        }
                    }
                    const selectors = exp.params;
                    const orders = [];
                    for (const selector of selectors) {
                        const selectorFn = selector.items[0];
                        const direction = selector.items[1] ? selector.items[1] : new ValueExpression("ASC");
                        const visitParam = { selectExpression: objectOperand, scope: exp.methodName };
                        const selectExp = this.visitFunction(selectorFn, [objectOperand.getItemExpression()], visitParam);
                        if (!isValueType(selectExp.type)) {
                            throw new Error(`Queryable<${objectOperand.itemType.name}>.orderBy required select with basic type return value.`);
                        }
                        orders.push({
                            column: selectExp,
                            direction: direction.value
                        });
                    }
                    if (orders.length > 0) {
                        objectOperand.setOrder(orders);
                    }
                    return objectOperand;
                }
                case "count": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const countExp = new MethodCallExpression(objectOperand, exp.methodName, objectOperand.entity.primaryColumns, Number);
                    const parentRel = selectOperand.parentRelation;
                    if (param.scope === "queryable") {
                        // call from queryable
                        const column = new ComputedColumnExpression(objectOperand.entity, countExp, this.newAlias("column"));
                        objectOperand.selects = [column];
                        objectOperand.itemExpression = column;
                        objectOperand.distinct = true;
                        return objectOperand;
                    }
                    else if (selectOperand instanceof GroupedExpression || (parentRel && parentRel.parent instanceof GroupByExpression)) {
                        // don't select unnecessary column
                        if (param.scope && param.scope.indexOf("select") === 0) {
                            selectOperand.selects = [];
                        }
                        return countExp;
                    }
                    else {
                        // any is used on related entity. change query to groupby.
                        const objExp = new ObjectValueExpression({});
                        if (parentRel) {
                            for (const relCol of parentRel.childColumns) {
                                objExp.object[relCol.propertyName] = relCol;
                            }
                        }
                        const groupExp = new GroupByExpression(selectOperand, objExp);
                        groupExp.isAggregate = true;
                        const column = new ComputedColumnExpression(groupExp.entity, countExp, this.newAlias("column"));
                        column.isNullable = false;
                        groupExp.selects.push(column);
                        if (parentRel && parentRel.isManyToManyRelation) {
                            // alter relation to: parent -> bridge -> groupExp
                            const parentSelect = parentRel.parent;
                            parentSelect.joins.delete(parentRel);
                            const bridge = new SelectExpression(parentSelect.entity.clone());
                            this.setDefaultBehaviour(bridge);
                            bridge.entity.alias = this.newAlias();
                            bridge.selects = [];
                            const replaceMap = new Map();
                            mapReplaceExp(replaceMap, parentSelect.entity, bridge.entity);
                            mapKeepExp(replaceMap, groupExp);
                            // relation bridge -> groupExp
                            bridge.addJoin(groupExp, parentRel.relation.clone(replaceMap), parentRel.type);
                            // group the bridge so it could be easily join to parent
                            const bridgeAggreateExp = new MethodCallExpression(bridge, "sum", [column], Number);
                            const bridgeColumn = new ComputedColumnExpression(bridge.entity, bridgeAggreateExp, this.newAlias("column"));
                            bridgeColumn.isNullable = false;
                            const groupKey = new ObjectValueExpression({});
                            // add join from parent to bridge
                            let bridgeParentRelation;
                            for (const primaryCol of bridge.entity.primaryColumns) {
                                groupKey.object[primaryCol.propertyName] = primaryCol;
                                const pCol = parentSelect.projectedColumns.first((o) => o.columnName === primaryCol.columnName);
                                const logicalExp = new StrictEqualExpression(primaryCol, pCol);
                                bridgeParentRelation = bridgeParentRelation ? new AndExpression(bridgeParentRelation, logicalExp) : logicalExp;
                            }
                            const groupedBridge = new GroupByExpression(bridge, groupKey);
                            groupedBridge.isAggregate = true;
                            parentSelect.addJoin(groupedBridge, bridgeParentRelation, "LEFT");
                            groupedBridge.selects.add(bridgeColumn);
                            return bridgeColumn;
                        }
                        return column;
                    }
                }
                case "sum":
                case "avg":
                case "max":
                case "min": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    if (exp.params.length > 0) {
                        const selectorFn = exp.params[0];
                        const visitParam = { selectExpression: selectOperand, scope: param.scope };
                        const selectExpression = this.visit(new MethodCallExpression(objectOperand, "select", [selectorFn]), visitParam);
                        param.selectExpression = visitParam.selectExpression;
                        if (!isValueType(selectExpression.itemType)) {
                            throw new Error(`Queryable<${selectOperand.type.name}> required select with basic type return value.`);
                        }
                        selectOperand = selectExpression;
                    }
                    const aggregateExp = new MethodCallExpression(selectOperand, exp.methodName, selectOperand.selects.select((o) => {
                        if (o instanceof ComputedColumnExpression) {
                            return o.expression;
                        }
                        return o;
                    }).toArray(), Number);
                    const parentRel = selectOperand.parentRelation;
                    if (param.scope === "queryable") {
                        // call from queryable
                        const column = new ComputedColumnExpression(selectOperand.entity, aggregateExp, this.newAlias("column"));
                        objectOperand.selects = [column];
                        objectOperand.distinct = true;
                        return objectOperand;
                    }
                    else if (selectOperand instanceof GroupByExpression || (parentRel && parentRel.parent instanceof GroupByExpression)) {
                        return aggregateExp;
                    }
                    else {
                        // any is used on related entity. change query to groupby.
                        const objExp = new ObjectValueExpression({});
                        if (parentRel) {
                            for (const relCol of parentRel.childColumns) {
                                objExp.object[relCol.propertyName] = relCol;
                            }
                        }
                        const groupExp = new GroupByExpression(selectOperand, objExp);
                        groupExp.isAggregate = true;
                        const column = new ComputedColumnExpression(groupExp.entity, aggregateExp, this.newAlias("column"));
                        column.isNullable = false;
                        groupExp.selects.push(column);
                        if (parentRel && parentRel.isManyToManyRelation) {
                            // alter relation to: parent -> bridge -> groupExp
                            const parentSelect = parentRel.parent;
                            parentSelect.joins.delete(parentRel);
                            const bridge = new SelectExpression(parentSelect.entity.clone());
                            this.setDefaultBehaviour(bridge);
                            bridge.entity.alias = this.newAlias();
                            bridge.selects = [];
                            const replaceMap = new Map();
                            mapReplaceExp(replaceMap, parentSelect.entity, bridge.entity);
                            mapKeepExp(replaceMap, groupExp);
                            // relation bridge -> groupExp
                            bridge.addJoin(groupExp, parentRel.relation.clone(replaceMap), parentRel.type);
                            // group the bridge so it could be easily join to parent
                            const bridgeAggreateExp = new MethodCallExpression(bridge, exp.methodName, [column], Number);
                            const bridgeColumn = new ComputedColumnExpression(bridge.entity, bridgeAggreateExp, this.newAlias("column"));
                            bridgeColumn.isNullable = false;
                            const groupKey = new ObjectValueExpression({});
                            // add join from parent to bridge
                            let bridgeParentRelation;
                            for (const primaryCol of bridge.entity.primaryColumns) {
                                groupKey.object[primaryCol.propertyName] = primaryCol;
                                const pCol = parentSelect.projectedColumns.first((o) => o.columnName === primaryCol.columnName);
                                const logicalExp = new StrictEqualExpression(primaryCol, pCol);
                                bridgeParentRelation = bridgeParentRelation ? new AndExpression(bridgeParentRelation, logicalExp) : logicalExp;
                            }
                            const groupedBridge = new GroupByExpression(bridge, groupKey);
                            groupedBridge.isAggregate = true;
                            parentSelect.addJoin(groupedBridge, bridgeParentRelation, "LEFT");
                            groupedBridge.selects.add(bridgeColumn);
                            return bridgeColumn;
                        }
                        return column;
                    }
                }
                case "all":
                case "any": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const isAny = exp.methodName === "any";
                    if (!isAny && exp.params.length <= 0) {
                        throw new Error("All required 1 parameter");
                    }
                    if (exp.params.length > 0) {
                        let predicateFn = exp.params[0];
                        if (!isAny) {
                            predicateFn = new FunctionExpression(new NotExpression(predicateFn.body), predicateFn.params, predicateFn.type);
                        }
                        const visitParam = { selectExpression: selectOperand, scope: param.scope };
                        this.visit(new MethodCallExpression(selectOperand, "where", [predicateFn]), visitParam);
                    }
                    const anyExp = new ValueExpression(isAny);
                    const parentRel = selectOperand.parentRelation;
                    if (param.scope === "queryable") {
                        // call from queryable
                        const column = new ComputedColumnExpression(objectOperand.entity, anyExp, this.newAlias("column"));
                        objectOperand.selects = [column];
                        objectOperand.paging.take = new ValueExpression(1);
                        objectOperand.distinct = true;
                        if (objectOperand instanceof GroupByExpression) {
                            objectOperand.isAggregate = true;
                        }
                        return objectOperand;
                    }
                    else if (selectOperand instanceof GroupedExpression || (parentRel && parentRel.parent instanceof GroupByExpression)) {
                        // don't select unnecessary column
                        if (param.scope && param.scope.indexOf("select") === 0) {
                            selectOperand.selects = [];
                        }
                        return anyExp;
                    }
                    else {
                        // any is used on related entity. change query to groupby.
                        const objExp = new ObjectValueExpression({});
                        if (parentRel) {
                            for (const relCol of parentRel.childColumns) {
                                objExp.object[relCol.propertyName] = relCol;
                            }
                        }
                        const groupExp = new GroupByExpression(selectOperand, objExp);
                        groupExp.isAggregate = true;
                        const column = new ComputedColumnExpression(groupExp.entity, anyExp, this.newAlias("column"));
                        column.isNullable = false;
                        groupExp.selects.push(column);
                        if (parentRel && parentRel.isManyToManyRelation) {
                            // alter relation to: parent -> bridge -> groupExp
                            const parentSelect = parentRel.parent;
                            parentSelect.joins.delete(parentRel);
                            const bridge = new SelectExpression(parentSelect.entity.clone());
                            this.setDefaultBehaviour(bridge);
                            bridge.entity.alias = this.newAlias();
                            bridge.selects = [];
                            const replaceMap = new Map();
                            mapReplaceExp(replaceMap, parentSelect.entity, bridge.entity);
                            mapKeepExp(replaceMap, groupExp);
                            // relation bridge -> groupExp
                            let bridgeCurRelation = parentRel.relation.clone(replaceMap);
                            if (!isAny) {
                                bridgeCurRelation = new NotExpression(bridgeCurRelation);
                            }
                            bridge.addJoin(groupExp, bridgeCurRelation, parentRel.type);
                            // group the bridge so it could be easily join to parent
                            let bridgeAggreateExp;
                            if (isAny) {
                                bridgeAggreateExp = new StrictNotEqualExpression(new MethodCallExpression(bridge, "sum", [column], Number), new ValueExpression(null));
                            }
                            else {
                                bridgeAggreateExp = new StrictEqualExpression(new MethodCallExpression(bridge, "sum", [column], Number), new ValueExpression(null));
                            }
                            const bridgeColumn = new ComputedColumnExpression(bridge.entity, bridgeAggreateExp, this.newAlias("column"));
                            bridgeColumn.isNullable = false;
                            const groupKey = new ObjectValueExpression({});
                            // add join from parent to bridge
                            let bridgeParentRelation;
                            for (const primaryCol of bridge.entity.primaryColumns) {
                                groupKey.object[primaryCol.propertyName] = primaryCol;
                                const pCol = parentSelect.projectedColumns.first((o) => o.columnName === primaryCol.columnName);
                                const logicalExp = new StrictEqualExpression(primaryCol, pCol);
                                bridgeParentRelation = bridgeParentRelation ? new AndExpression(bridgeParentRelation, logicalExp) : logicalExp;
                            }
                            const groupedBridge = new GroupByExpression(bridge, groupKey);
                            groupedBridge.isAggregate = true;
                            parentSelect.addJoin(groupedBridge, bridgeParentRelation, "LEFT");
                            groupedBridge.selects.add(bridgeColumn);
                            return new StrictEqualExpression(bridgeColumn, new ValueExpression(1));
                        }
                        const parentCol = new ColumnExpression(column.entity, column.type, column.propertyName, column.columnName, column.isPrimary, column.isNullable);
                        return new (isAny ? StrictNotEqualExpression : StrictEqualExpression)(parentCol, new ValueExpression(null));
                    }
                }
                case "first": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    if (exp.params.length > 0) {
                        const predicateFn = exp.params[0];
                        const visitParam = { selectExpression: selectOperand, scope: exp.methodName };
                        this.visit(new MethodCallExpression(selectOperand, "where", [predicateFn]), visitParam);
                        param.selectExpression = visitParam.selectExpression;
                    }
                    if (param.scope === "queryable") {
                        selectOperand.paging.take = new ValueExpression(1);
                    }
                    else {
                        const entityExp = objectOperand.entity;
                        const filterer = objectOperand.clone();
                        filterer.entity.alias = this.newAlias();
                        filterer.includes = [];
                        const sorter = filterer.clone();
                        sorter.entity.alias = this.newAlias();
                        // column used for parent relations.
                        const parentRel = objectOperand.parentRelation;
                        const relationColumns = parentRel.childColumns;
                        let joinExp;
                        for (const relCol of relationColumns) {
                            const sortCol = sorter.entity.columns.first((col) => col.propertyName === relCol.propertyName);
                            const filterCol = filterer.entity.columns.first((col) => col.propertyName === relCol.propertyName);
                            const logicalExp = new StrictEqualExpression(sortCol, filterCol);
                            joinExp = joinExp ? new AndExpression(joinExp, logicalExp) : logicalExp;
                        }
                        let orderExp;
                        for (let i = 0, len = entityExp.primaryColumns.length; i < len; i++) {
                            const sortCol = sorter.entity.primaryColumns[i];
                            const filterCol = filterer.entity.primaryColumns[i];
                            const orderCompExp = new GreaterEqualExpression(sortCol, filterCol);
                            orderExp = orderExp ? new OrExpression(orderCompExp, new AndExpression(new StrictEqualExpression(sortCol, filterCol), orderExp)) : orderCompExp;
                        }
                        for (let i = 0, len = objectOperand.orders.length; i < len; i++) {
                            const order = objectOperand.orders[i];
                            const sortCol = sorter.orders[i].column;
                            const filterCol = filterer.orders[i].column;
                            const orderCompExp = new (order.direction === "DESC" ? LessThanExpression : GreaterThanExpression)(sortCol, filterCol);
                            orderExp = new OrExpression(orderCompExp, new AndExpression(new StrictEqualExpression(sortCol, filterCol), orderExp));
                        }
                        sorter.orders = filterer.orders = [];
                        filterer.addJoin(sorter, new AndExpression(joinExp, orderExp), "INNER");
                        const countExp = new MethodCallExpression(filterer, "count", filterer.entity.primaryColumns, Number);
                        const colCountExp = new ComputedColumnExpression(filterer.entity, countExp, this.newAlias("column"));
                        let keyExp;
                        if (filterer.entity.primaryColumns.length > 1) {
                            keyExp = new ObjectValueExpression({});
                            for (const o of filterer.entity.primaryColumns) {
                                keyExp.object[o.propertyName] = o;
                            }
                        }
                        else {
                            keyExp = filterer.entity.primaryColumns.first();
                        }
                        const groupExp = new GroupByExpression(filterer, keyExp);
                        groupExp.isAggregate = true;
                        groupExp.selects = [colCountExp];
                        // add join relation to current object operand
                        let joinRelation;
                        for (let i = 0, len = entityExp.primaryColumns.length; i < len; i++) {
                            const objCol = entityExp.primaryColumns[i];
                            const groupCol = groupExp.entity.primaryColumns[i];
                            const logicalExp = new StrictEqualExpression(objCol, groupCol);
                            joinRelation = joinRelation ? new AndExpression(joinRelation, logicalExp) : logicalExp;
                        }
                        objectOperand.addJoin(groupExp, joinRelation, "INNER");
                        groupExp.having = new LessEqualExpression(countExp, new ValueExpression(1));
                    }
                    return selectOperand.entity;
                }
                case "skip":
                case "take": {
                    let paramExp = this.visit(exp.params[0], param);
                    if (param.scope === "queryable") {
                        if (objectOperand instanceof GroupByExpression && !objectOperand.isAggregate) {
                            // join to select that will page result by group instead of item.
                            const selectExp = objectOperand.itemSelect.clone();
                            selectExp.entity.alias = this.newAlias();
                            selectExp.selects = selectExp.groupBy.slice();
                            selectExp.includes = [];
                            selectExp.distinct = true;
                            selectOperand = selectExp;
                            let relation;
                            for (let i = 0, len = objectOperand.groupBy.length; i < len; i++) {
                                const parentCol = objectOperand.groupBy[i];
                                const childCol = selectExp.groupBy[i];
                                const logicalExp = new StrictEqualExpression(parentCol, childCol);
                                relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                            }
                            objectOperand.addJoin(selectExp, relation, "INNER");
                        }
                        if (exp.methodName === "skip") {
                            if (selectOperand.paging.take) {
                                selectOperand.paging.take = this.visit(new SubstractionExpression(selectOperand.paging.take, paramExp), param);
                                paramExp = this.visit(exp.params[0], param);
                            }
                            selectOperand.paging.skip = this.visit(selectOperand.paging.skip ? new AdditionExpression(selectOperand.paging.skip, paramExp) : paramExp, param);
                        }
                        else {
                            selectOperand.paging.take = this.visit(selectOperand.paging.take ? new MethodCallExpression(new ValueExpression(Math), "min", [selectOperand.paging.take, paramExp]) : paramExp, param);
                        }
                    }
                    else {
                        let takeJoinRel = objectOperand.joins.ofType(PagingJoinRelation).first();
                        if (!takeJoinRel) {
                            const entityExp = objectOperand.entity;
                            const filterer = objectOperand.clone();
                            filterer.entity.alias = this.newAlias();
                            filterer.includes = [];
                            filterer.selects = [];
                            const sorter = filterer.clone();
                            sorter.entity.alias = this.newAlias();
                            // column used for parent relations.
                            const parentRel = objectOperand.parentRelation;
                            const relationColumns = parentRel.childColumns;
                            let joinExp;
                            for (const relCol of relationColumns) {
                                const sortCol = sorter.entity.columns.first((col) => col.propertyName === relCol.propertyName);
                                const filterCol = filterer.entity.columns.first((col) => col.propertyName === relCol.propertyName);
                                const logicalExp = new StrictEqualExpression(sortCol, filterCol);
                                joinExp = joinExp ? new AndExpression(joinExp, logicalExp) : logicalExp;
                            }
                            let orderExp;
                            for (let i = 0, len = entityExp.primaryColumns.length; i < len; i++) {
                                const sortCol = sorter.entity.primaryColumns[i];
                                const filterCol = filterer.entity.primaryColumns[i];
                                const orderCompExp = new GreaterEqualExpression(sortCol, filterCol);
                                orderExp = orderExp ? new OrExpression(orderCompExp, new AndExpression(new StrictEqualExpression(sortCol, filterCol), orderExp)) : orderCompExp;
                            }
                            for (let i = 0, len = objectOperand.orders.length; i < len; i++) {
                                const order = objectOperand.orders[i];
                                const sortCol = sorter.orders[i].column;
                                const filterCol = filterer.orders[i].column;
                                const orderCompExp = new (order.direction === "DESC" ? LessThanExpression : GreaterThanExpression)(sortCol, filterCol);
                                orderExp = new OrExpression(orderCompExp, new AndExpression(new StrictEqualExpression(sortCol, filterCol), orderExp));
                            }
                            sorter.orders = filterer.orders = [];
                            filterer.addJoin(sorter, new AndExpression(joinExp, orderExp), "INNER");
                            const innercountExp = new MethodCallExpression(filterer, "count", filterer.entity.primaryColumns, Number);
                            const colCountExp = new ComputedColumnExpression(filterer.entity, innercountExp, this.newAlias("column"));
                            let keyExp;
                            if (filterer.entity.primaryColumns.length > 1) {
                                keyExp = new ObjectValueExpression({});
                                for (const o of filterer.entity.primaryColumns) {
                                    keyExp.object[o.propertyName] = o;
                                }
                            }
                            else {
                                keyExp = filterer.entity.primaryColumns.first();
                            }
                            const innerGroupExp = new GroupByExpression(filterer, keyExp);
                            innerGroupExp.isAggregate = true;
                            innerGroupExp.selects.push(colCountExp);
                            // add join relation to current object operand
                            let joinRelation;
                            for (let i = 0, len = entityExp.primaryColumns.length; i < len; i++) {
                                const objCol = entityExp.primaryColumns[i];
                                const groupCol = innerGroupExp.entity.primaryColumns[i];
                                const logicalExp = new StrictEqualExpression(objCol, groupCol);
                                joinRelation = joinRelation ? new AndExpression(joinRelation, logicalExp) : logicalExp;
                            }
                            takeJoinRel = new PagingJoinRelation(objectOperand, innerGroupExp, joinRelation, "INNER");
                            objectOperand.joins.push(takeJoinRel);
                            innerGroupExp.parentRelation = takeJoinRel;
                        }
                        const groupExp = takeJoinRel.child;
                        const countExp = groupExp.selects.except(groupExp.groupBy).first().expression;
                        if (exp.methodName === "skip") {
                            takeJoinRel.start = this.visit(takeJoinRel.start ? new AdditionExpression(takeJoinRel.start, paramExp) : paramExp, param);
                        }
                        else {
                            takeJoinRel.end = this.visit(takeJoinRel.start ? new AdditionExpression(takeJoinRel.start, paramExp) : paramExp, param);
                        }
                        groupExp.having = null;
                        if (takeJoinRel.start) {
                            groupExp.having = new GreaterThanExpression(countExp, takeJoinRel.start);
                        }
                        if (takeJoinRel.end) {
                            const takeLogicalExp = new LessEqualExpression(countExp, takeJoinRel.end);
                            groupExp.having = groupExp.having ? new AndExpression(groupExp.having, takeLogicalExp) : takeLogicalExp;
                        }
                    }
                    return objectOperand;
                }
                case "union":
                case "intersect":
                case "except": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const parentRelation = objectOperand.parentRelation;
                    const visitParam = { selectExpression: selectOperand, scope: exp.methodName };
                    const childSelectOperand = this.visit(exp.params[0], visitParam);
                    param.selectExpression = visitParam.selectExpression;
                    let entityExp;
                    switch (exp.methodName) {
                        case "union":
                            const isUnionAllExp = this.visit(exp.params[1], param);
                            entityExp = new UnionExpression(selectOperand, childSelectOperand, isUnionAllExp);
                            break;
                        case "intersect":
                            entityExp = new IntersectExpression(selectOperand, childSelectOperand);
                            break;
                        case "except":
                            entityExp = new ExceptExpression(selectOperand, childSelectOperand);
                            break;
                    }
                    selectOperand = new SelectExpression(entityExp);
                    selectOperand.parameterTree = param.selectExpression.parameterTree;
                    this.setDefaultBehaviour(selectOperand);
                    if (parentRelation) {
                        parentRelation.child = selectOperand;
                        selectOperand.parentRelation = parentRelation;
                    }
                    else {
                        param.selectExpression = selectOperand;
                    }
                    return selectOperand;
                }
                case "innerJoin":
                case "leftJoin":
                case "rightJoin":
                case "fullJoin":
                case "groupJoin": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const parentRelation = objectOperand.parentRelation;
                    const visitParam = { selectExpression: selectOperand, scope: "join" };
                    const childSelectOperand = this.visit(exp.params[0], visitParam);
                    let jointType;
                    switch (exp.methodName) {
                        case "groupJoin":
                        case "leftJoin":
                            jointType = "LEFT";
                            break;
                        case "rightJoin":
                            jointType = "RIGHT";
                            break;
                        case "fullJoin":
                            jointType = "FULL";
                            break;
                        default:
                            jointType = "INNER";
                            break;
                    }
                    const relationSelector = exp.params[1];
                    const relation = this.visitFunction(relationSelector, [selectOperand.getItemExpression(), childSelectOperand.getItemExpression()], visitParam);
                    if (exp.methodName === "groupJoin") {
                        childSelectOperand.parentRelation = new JoinRelation(selectOperand, childSelectOperand, relation, jointType);
                    }
                    else {
                        selectOperand.addJoin(childSelectOperand, relation, jointType);
                    }
                    const resultVisitParam = { selectExpression: selectOperand, scope: "join" };
                    const resultSelector = exp.params[2];
                    const paramExp = resultSelector.params.pop();
                    this.stack.push(paramExp.name, exp.methodName === "groupJoin" ? childSelectOperand : childSelectOperand.getItemExpression());
                    this.visit(new MethodCallExpression(selectOperand, "select", [resultSelector]), resultVisitParam);
                    this.stack.pop(paramExp.name);
                    if (parentRelation) {
                        parentRelation.child = selectOperand;
                        selectOperand.parentRelation = parentRelation;
                    }
                    else {
                        param.selectExpression = selectOperand;
                    }
                    return selectOperand;
                }
                case "crossJoin": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const parentRelation = objectOperand.parentRelation;
                    const visitParam = { selectExpression: selectOperand, scope: "join" };
                    const childSelectOperand = this.visit(exp.params[0], visitParam);
                    selectOperand.addJoin(childSelectOperand, null, "CROSS");
                    const resultVisitParam = { selectExpression: selectOperand, scope: "join" };
                    const resultSelector = exp.params[1];
                    const paramExp = resultSelector.params.pop();
                    this.stack.push(paramExp.name, childSelectOperand.getItemExpression());
                    this.visit(new MethodCallExpression(selectOperand, "select", [new ValueExpression(Object), resultSelector]), resultVisitParam);
                    this.stack.pop(paramExp.name);
                    if (parentRelation) {
                        parentRelation.child = selectOperand;
                        selectOperand.parentRelation = parentRelation;
                    }
                    else {
                        param.selectExpression = selectOperand;
                    }
                    return selectOperand;
                }
                case "pivot": {
                    if (param.scope === "include" || param.scope === "project") {
                        throw new Error(`${param.scope} did not support ${exp.methodName}`);
                    }
                    const parentRelation = objectOperand.parentRelation;
                    const dimensions = exp.params[0];
                    const metrics = exp.params[1];
                    // groupby
                    let visitParam = { selectExpression: objectOperand, scope: exp.methodName };
                    const groupExp = this.visit(new MethodCallExpression(objectOperand, "groupBy", [dimensions]), visitParam);
                    param.selectExpression = visitParam.selectExpression;
                    const dObject = dimensions.body.object;
                    const mObject = metrics.body.object;
                    const dmObject = {};
                    for (const prop in dObject) {
                        dmObject[prop] = new MemberAccessExpression(new MemberAccessExpression(metrics.params[0], "key"), prop);
                    }
                    for (const prop in mObject) {
                        dmObject[prop] = mObject[prop];
                    }
                    // select
                    const selectorFn = new FunctionExpression(new ObjectValueExpression(dmObject), metrics.params);
                    this.stack.push(dimensions.params[0].name, groupExp.key);
                    this.stack.push(selectorFn.params[0].name, groupExp.getItemExpression());
                    visitParam = { selectExpression: groupExp, scope: exp.methodName };
                    const selectExpression = this.visit(new MethodCallExpression(groupExp, "select", [selectorFn]), visitParam);
                    this.stack.pop(selectorFn.params[0].name);
                    this.stack.pop(dimensions.params[0].name);
                    param.selectExpression = visitParam.selectExpression;
                    selectOperand = selectExpression;
                    if (parentRelation) {
                        parentRelation.child = selectOperand;
                        selectOperand.parentRelation = parentRelation;
                    }
                    else {
                        param.selectExpression = selectOperand;
                    }
                    return selectOperand;
                }
                case "toArray": {
                    if (objectOperand instanceof GroupedExpression) {
                        const groupExp = objectOperand.groupByExp;
                        const entityExp = objectOperand.entity.clone();
                        entityExp.alias = this.newAlias();
                        const selectExp = new SelectExpression(entityExp);
                        selectExp.selects = objectOperand.selects.select((o) => entityExp.columns.first((c) => c.propertyName === o.propertyName)).toArray();
                        let relation;
                        const cloneMap = new Map();
                        mapReplaceExp(cloneMap, objectOperand.entity, entityExp);
                        for (const col of groupExp.groupBy) {
                            const childCol = col instanceof ComputedColumnExpression ? col.clone(cloneMap) : entityExp.columns.first((o) => o.propertyName === col.propertyName);
                            const logicalExp = new StrictEqualExpression(col, childCol);
                            relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                        }
                        groupExp.addJoin(selectExp, relation, "LEFT");
                        return selectExp;
                    }
                    return objectOperand;
                }
            }
            throw new Error(`${exp.methodName} not supported on expression`);
        }
        else {
            exp.params = exp.params.select((o) => this.visit(o, { selectExpression: param.selectExpression })).toArray();
            const isObjectOperandSafe = this.isSafe(objectOperand);
            const isExpressionSafe = isObjectOperandSafe && exp.params.all((o) => this.isSafe(o));
            let objectOperandValue;
            if (isObjectOperandSafe) {
                let a = objectOperand;
                if (a instanceof SqlParameterExpression) {
                    const value = this.valueTransformer.execute(a.valueExp);
                    a = new ValueExpression(value);
                    // TODO: remove sqlparameter
                }
                if (a instanceof ValueExpression) {
                    objectOperandValue = a.value;
                }
            }
            let translator;
            if (!isNull(objectOperandValue)) {
                translator = this.translator.resolve(objectOperandValue, exp.methodName);
                if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
                    return exp;
                }
            }
            if (!translator && objectOperand.type) {
                translator = this.translator.resolve(objectOperand.type.prototype, exp.methodName);
                if (translator && (!isExpressionSafe || translator.isTranslate(exp))) {
                    return exp;
                }
            }
            // Execute in app if all parameter is available.
            if (isExpressionSafe) {
                let hasParam = false;
                if (exp.objectOperand instanceof SqlParameterExpression) {
                    param.selectExpression.parameterTree.node.delete(exp.objectOperand);
                    exp.objectOperand = exp.objectOperand.valueExp;
                    hasParam = true;
                }
                exp.params = exp.params.select((o) => {
                    if (o instanceof SqlParameterExpression) {
                        param.selectExpression.parameterTree.node.delete(o);
                        hasParam = true;
                        return o.valueExp;
                    }
                    return o;
                }).toArray();
                if (hasParam) {
                    return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
                }
                return new ValueExpression(this.valueTransformer.execute(exp));
            }
            const methodFn = objectOperandValue ? objectOperandValue[exp.methodName] : objectOperand.type.prototype[exp.methodName];
            if (methodFn && !isNativeFunction(methodFn)) {
                // try convert user defined method to a FunctionExpression and built it as a query.
                const methodExp = ExpressionBuilder.parse(methodFn);
                methodExp.params.unshift(new ParameterExpression("this", exp.objectOperand.type));
                const params = [exp.objectOperand].concat(exp.params);
                const result = this.visitFunction(methodExp, params, { selectExpression: param.selectExpression });
                return result;
            }
        }
        throw new Error(`${exp.methodName} not supported.`);
    }
    // TODO: change to easy logic
    visitObjectLiteral(expression, param) {
        let requireCopy = false;
        const requireAlias = param.scope !== "groupBy";
        switch (param.scope) {
            case "groupBy":
            case "select-object": {
                requireCopy = true;
                break;
            }
            case "select": {
                break;
            }
            default: {
                for (const prop in expression.object) {
                    expression.object[prop] = this.visit(expression.object[prop], param);
                }
                return expression;
            }
        }
        const selectExp = param.selectExpression;
        const isGrouped = selectExp instanceof GroupByExpression;
        const entityExp = selectExp.entity;
        let embeddedEntity = entityExp;
        let embeddedSelect = selectExp;
        const possibleKeys = [];
        if (requireCopy) {
            embeddedEntity = entityExp.clone();
            embeddedSelect = new SelectExpression(embeddedEntity);
            if (selectExp instanceof GroupByExpression) {
                let clonedKey;
                const cloneMap = new Map();
                mapReplaceExp(cloneMap, entityExp, embeddedEntity);
                if (isEntityExp(selectExp.key)) {
                    const keySelectExp = selectExp.key.select;
                    const clone = keySelectExp.clone(cloneMap);
                    clonedKey = clone.entity;
                    mapReplaceExp(cloneMap, selectExp.key, clonedKey);
                    clone.parentRelation = keySelectExp.parentRelation.clone(cloneMap);
                }
                else {
                    clonedKey = selectExp.key.clone(cloneMap);
                }
                embeddedSelect = new GroupByExpression(embeddedSelect, clonedKey);
            }
            const oldParam = selectExp.getItemExpression();
            const embeddedParam = embeddedSelect.getItemExpression();
            for (const [key] of this.stack) {
                const val = this.stack.get(key);
                if (val === oldParam) {
                    possibleKeys.push(key);
                    this.stack.push(key, embeddedParam);
                }
            }
        }
        const includes = [];
        const selects = [];
        for (const prop in expression.object) {
            let valExp = expression.object[prop];
            const litVisitParam = { selectExpression: embeddedSelect, scope: "select-object" };
            valExp = this.visit(valExp, litVisitParam);
            if (valExp instanceof SelectExpression) {
                if (isGrouped) {
                    if (valExp instanceof GroupedExpression && valExp.groupByExp === embeddedSelect) {
                        const parentGroupExp = embeddedSelect;
                        const childSelectExp = parentGroupExp.clone();
                        const childEntity = childSelectExp.entity;
                        childEntity.alias = this.newAlias();
                        const replaceMap1 = new Map();
                        mapReplaceExp(replaceMap1, entityExp, childEntity);
                        let relation;
                        for (const pCol of parentGroupExp.primaryKeys) {
                            const childCol = childSelectExp.primaryKeys.first((o) => o.propertyName === pCol.propertyName);
                            const logicalExp = new StrictEqualExpression(pCol, childCol);
                            relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                        }
                        const include = embeddedSelect.addInclude(prop, childSelectExp, relation, "one");
                        embeddedSelect.includes.delete(include);
                        includes.push(include);
                    }
                    else {
                        const include = joinToInclude(valExp, embeddedSelect, prop, "many");
                        embeddedSelect.includes.delete(include);
                        includes.push(include);
                    }
                }
                else {
                    const include = joinToInclude(valExp, embeddedSelect, prop, "many");
                    embeddedSelect.includes.delete(include);
                    includes.push(include);
                }
            }
            else if (isEntityExp(valExp)) {
                if (valExp === embeddedSelect.entity) {
                    const childSelectExp = embeddedSelect.clone();
                    const entityClone = childSelectExp.entity;
                    entityClone.alias = this.newAlias();
                    let relation;
                    for (const pCol of entityClone.primaryColumns) {
                        const childCol = valExp.primaryColumns.first((o) => o.propertyName === pCol.propertyName);
                        const logicalExp = new StrictEqualExpression(pCol, childCol);
                        relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                    }
                    const include = embeddedSelect.addInclude(prop, childSelectExp, relation, "one");
                    embeddedSelect.includes.delete(include);
                    includes.push(include);
                }
                else {
                    const childSelectExp = valExp.select;
                    const include = joinToInclude(childSelectExp, embeddedSelect, prop, "one");
                    embeddedSelect.includes.delete(include);
                    includes.push(include);
                }
            }
            else if (isColumnExp(valExp)) {
                let columnExp;
                // TODO: should check reference instead
                if (valExp instanceof ComputedColumnExpression && valExp.entity.alias !== embeddedEntity.alias) {
                    columnExp = new ColumnExpression(valExp.entity, valExp.type, prop, valExp.dataPropertyName, valExp.isPrimary, valExp.isNullable);
                }
                else {
                    const cloneMap = new Map();
                    mapKeepExp(cloneMap, valExp.entity);
                    if (valExp instanceof ComputedColumnExpression) {
                        cloneMap.set(valExp.expression, valExp.expression);
                    }
                    columnExp = valExp.clone(cloneMap);
                    columnExp.propertyName = prop;
                }
                if (requireAlias && !columnExp.alias) {
                    columnExp.alias = this.newAlias("column");
                }
                selects.push(columnExp);
            }
            else {
                const columnExp = new ComputedColumnExpression(embeddedEntity, valExp, prop, this.newAlias("column"));
                // aggregated column should be not nullable
                if (valExp instanceof MethodCallExpression && valExp.type === Number) {
                    columnExp.isNullable = false;
                }
                selects.push(columnExp);
            }
        }
        embeddedSelect.selects = selects;
        embeddedSelect.includes = includes;
        embeddedSelect.itemExpression = expression;
        if (embeddedSelect instanceof GroupByExpression) {
            embeddedSelect.isAggregate = true;
        }
        if (requireCopy) {
            for (const key of possibleKeys) {
                this.stack.pop(key);
            }
            let relations;
            for (const pCol of selectExp.primaryKeys) {
                const embeddedCol = embeddedSelect.primaryKeys.first((o) => o.propertyName === pCol.propertyName);
                const logicalExp = new StrictEqualExpression(pCol, embeddedCol);
                relations = relations ? new AndExpression(relations, logicalExp) : logicalExp;
            }
            selectExp.addJoin(embeddedSelect, relations, "INNER", true);
        }
        return embeddedSelect.entity;
    }
    visitParameter(exp, param) {
        const items = this.stack.getAll(exp.name);
        const result = items.pop();
        if (result instanceof Queryable) {
            const selectExp = result.buildQuery(this);
            selectExp.isSubSelect = true;
            param.selectExpression.addJoin(selectExp, null, "LEFT");
            return selectExp;
        }
        else if (result instanceof Function) {
            return new ValueExpression(result, exp.name);
        }
        else if (result instanceof Array) {
            const arrayParamExp = new ParameterExpression(exp.name, Array, items.length);
            arrayParamExp.itemType = exp.itemType;
            const arrayValue = result;
            let arrayItemType = this.stack.get(`${exp.name}_itemtype`);
            const isTypeSpecified = !!arrayItemType;
            if (!arrayItemType) {
                arrayItemType = arrayValue.where((o) => !!o).first();
            }
            const itemType = arrayItemType ? arrayItemType.constructor : Object;
            // Temporary table
            const tempEntityMeta = new TempEntityMetaData(itemType, `${exp.name}_${items.length}`);
            const indexCol = new ColumnMetaData(Number, tempEntityMeta);
            indexCol.propertyName = indexCol.columnName = "__index";
            indexCol.nullable = false;
            // indexCol.columnType = "";
            tempEntityMeta.columns.push(indexCol);
            tempEntityMeta.primaryKeys.push(indexCol);
            if (arrayItemType && !isValueType(itemType)) {
                if (isTypeSpecified) {
                    for (const prop in arrayItemType) {
                        const colType = arrayItemType[prop];
                        if (isValueType(colType)) {
                            const col = new ColumnMetaData(colType, tempEntityMeta);
                            col.propertyName = col.columnName = prop;
                            col.nullable = true;
                            tempEntityMeta.columns.push(col);
                        }
                    }
                }
                else {
                    for (const prop in arrayItemType) {
                        const propValue = arrayItemType[prop];
                        if (propValue === null || (propValue !== undefined && isValue(propValue))) {
                            const colType = !isNull(propValue) ? propValue.constructor : String;
                            const col = new ColumnMetaData(colType, tempEntityMeta);
                            col.propertyName = col.columnName = prop;
                            col.nullable = true;
                            tempEntityMeta.columns.push(col);
                        }
                    }
                }
            }
            else {
                const valueCol = new ColumnMetaData(itemType, tempEntityMeta);
                valueCol.propertyName = valueCol.columnName = "__value";
                valueCol.nullable = true;
                tempEntityMeta.columns.push(valueCol);
            }
            const selectExp = new SelectExpression(new EntityExpression(tempEntityMeta, this.newAlias()));
            selectExp.selects = selectExp.entity.columns.where((o) => !o.isPrimary).toArray();
            selectExp.isSubSelect = true;
            param.selectExpression.addJoin(selectExp, null, "LEFT");
            param.selectExpression.addSqlParameter(this.newAlias("entity"), arrayParamExp, tempEntityMeta);
            return selectExp;
        }
        else if (result instanceof SelectExpression && !(result instanceof GroupedExpression)) {
            // assumpt all selectExpression parameter come from groupJoin
            const rel = result.parentRelation;
            const clone = result.clone();
            // new alias is required.
            clone.entity.alias = this.newAlias();
            const replaceMap = new Map();
            for (const oriCol of rel.childColumns) {
                replaceMap.set(oriCol, clone.entity.columns.find((o) => o.columnName === oriCol.columnName));
            }
            for (const oriCol of rel.parentColumns) {
                replaceMap.set(oriCol, param.selectExpression.entity.columns.find((o) => o.columnName === oriCol.columnName));
            }
            const relations = rel.relation.clone(replaceMap);
            param.selectExpression.addJoin(clone, relations, rel.type);
            return clone;
        }
        else if (isExpression(result)) {
            return result;
        }
        else {
            exp.index = items.length;
            return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
        }
    }
    visitTernaryOperator(exp, param) {
        exp.logicalOperand = this.visit(exp.logicalOperand, param);
        exp.trueOperand = this.visit(exp.trueOperand, param);
        exp.falseOperand = this.visit(exp.falseOperand, param);
        const isExpressionSafe = this.isSafe(exp.logicalOperand) && this.isSafe(exp.trueOperand) && this.isSafe(exp.falseOperand);
        if (isExpressionSafe) {
            let hasParam = false;
            if (exp.logicalOperand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.logicalOperand);
                exp.logicalOperand = exp.logicalOperand.valueExp;
                hasParam = true;
            }
            if (exp.trueOperand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.trueOperand);
                exp.trueOperand = exp.trueOperand.valueExp;
                hasParam = true;
            }
            if (exp.falseOperand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.falseOperand);
                exp.falseOperand = exp.falseOperand.valueExp;
                hasParam = true;
            }
            if (hasParam) {
                return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
            }
            return new ValueExpression(this.valueTransformer.execute(exp));
        }
        return exp;
    }
    visitUnaryOperator(exp, param) {
        exp.operand = this.visit(exp.operand, param);
        const isExpressionSafe = this.isSafe(exp.operand);
        if (isExpressionSafe) {
            if (exp.operand instanceof SqlParameterExpression) {
                param.selectExpression.parameterTree.node.delete(exp.operand);
                exp.operand = exp.operand.valueExp;
                return param.selectExpression.addSqlParameter(this.newAlias("param"), exp);
            }
            return new ValueExpression(this.valueTransformer.execute(exp));
        }
        if (exp.operand instanceof TernaryExpression) {
            const ternaryExp = exp.operand;
            const falseOperand = exp.clone();
            falseOperand.operand = ternaryExp.falseOperand;
            const trueOperand = exp.clone();
            trueOperand.operand = ternaryExp.trueOperand;
            return new TernaryExpression(ternaryExp.logicalOperand, trueOperand, falseOperand);
        }
        return exp;
    }
}
const joinToInclude = (childExp, parentExp, name, relationType) => {
    let parentRel = childExp.parentRelation;
    while (parentRel && parentRel.name === undefined && parentRel.parent !== parentExp) {
        const nextRel = parentRel.parent.parentRelation;
        parentRel.parent.joins.delete(parentRel);
        parentRel.child.addJoin(parentRel.parent, parentRel.relation, "INNER");
        parentRel = nextRel;
    }
    if (!parentRel) {
        return null;
    }
    parentExp.joins.delete(parentRel);
    const includeRel = parentExp.addInclude(name, childExp, parentRel.relation, relationType, parentRel.isEmbedded);
    return includeRel;
};
const reverseJoin = (childExp, root, isExclusive) => {
    if (root instanceof GroupedExpression) {
        root = root.groupByExp;
    }
    if (childExp === root) {
        return childExp;
    }
    const joinRels = [];
    let selectExp = childExp;
    while (selectExp.parentRelation && selectExp.parentRelation instanceof JoinRelation && (!root || (!isExclusive ? selectExp !== root : selectExp.parentRelation.parent !== root))) {
        const joinRel = selectExp.parentRelation;
        joinRels.push(joinRel);
        selectExp = joinRel.parent;
    }
    const rootRel = selectExp.parentRelation;
    for (const joinRel of joinRels) {
        const parent = joinRel.parent;
        const child = joinRel.child;
        parent.joins.delete(joinRel);
        if (joinRel.isEmbedded) {
            // turn parent into child by using all child selects and includes.
            const cloneMap = new Map();
            mapReplaceExp(cloneMap, child.entity, parent.entity);
            parent.selects = child.selects.select((o) => {
                let col = parent.allColumns.first((c) => c.dataPropertyName === o.dataPropertyName);
                if (!col) {
                    col = o.clone(cloneMap);
                }
                return col;
            }).toArray();
            parent.itemExpression = child.itemExpression;
            parent.includes = [];
            for (const include of child.includes) {
                mapKeepExp(cloneMap, include.child);
                parent.addInclude(include.name, include.child, include.relation.clone(cloneMap), include.type, include.isEmbedded);
            }
            for (const join of child.joins) {
                mapKeepExp(cloneMap, join.child);
                parent.addJoin(join.child, join.relation.clone(cloneMap), join.type, join.isEmbedded);
            }
            if (child === childExp) {
                childExp = parent;
            }
        }
        else {
            joinRel.child.addJoin(parent, joinRel.relation, "INNER", joinRel.isEmbedded);
        }
    }
    childExp.parentRelation = rootRel;
    if (rootRel) {
        rootRel.child = childExp;
    }
    childExp.parameterTree = root.parameterTree;
    return childExp;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFF1ZXJ5VmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Qcm92aWRlci9SZWxhdGlvbmFsL1JlbGF0aW9uYWxRdWVyeVZpc2l0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzdELE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBSWpHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBRXJHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNqRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSww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