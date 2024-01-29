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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFF1ZXJ5VmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1Byb3ZpZGVyL1JlbGF0aW9uYWwvUmVsYXRpb25hbFF1ZXJ5VmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFHN0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUMzRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDakYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDbkcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDbkcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFJakcsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFFckcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDbkcsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDL0YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUMvRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUN2RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw2REFBNkQsQ0FBQztBQUN2RyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUNuRyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDekUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEssT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRWpGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBUXZFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNsRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDcEcsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFDdEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFHdEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFFMUYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDcEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBRWxGLE1BQU0sT0FBTyxzQkFBc0I7SUFDL0I7UUFnQlEsYUFBUSxHQUE4QixFQUFFLENBQUM7UUFmN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBR0QsSUFBVyxLQUFLO1FBQ1osT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxJQUFXLEtBQUssQ0FBQyxDQUFpQjtRQUM5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUtNLFFBQVEsQ0FBQyxPQUFzQyxRQUFRO1FBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3RFLENBQUM7SUFFTSxtQkFBbUIsQ0FBSSxTQUE4QjtRQUN4RCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksU0FBUyxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNqRSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUkscUJBQXFCLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUVELElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxhQUFhO2lCQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBdUIsRUFBRSxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDdkcsT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUMvSCxDQUFDO0lBQ0wsQ0FBQztJQUNELHlCQUF5QjtJQUNsQixLQUFLLENBQUMsR0FBZ0IsRUFBRSxLQUEyQjtRQUN0RCw4REFBOEQ7UUFDOUQsUUFBUSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEIsS0FBSyxvQkFBb0IsQ0FBQztZQUMxQixLQUFLLHNCQUFzQixDQUFDLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxHQUFxQyxDQUFDO2dCQUMvRCxnQkFBZ0IsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25GLElBQUksZ0JBQWdCLENBQUMsYUFBYSxZQUFZLGlCQUFpQixFQUFFLENBQUM7b0JBQzlELE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLGFBQTRDLENBQUM7b0JBQ2pGLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO29CQUNyQyxXQUFXLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7b0JBQ25ELE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDO29CQUN0QyxZQUFZLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7b0JBQ3JELE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzdILENBQUM7Z0JBQ0QsT0FBTyxHQUFHLFlBQVksc0JBQXNCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3SCxDQUFDO1lBQ0QsS0FBSyxzQkFBc0I7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxLQUFLLHVCQUF1QjtnQkFDeEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RELEtBQUssaUJBQWlCO2dCQUNsQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEQsS0FBSyxxQkFBcUI7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0UsS0FBSyxvQkFBb0I7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUNuRCxLQUFLLGtCQUFrQjtnQkFDbkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQXlCLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLEtBQUssbUJBQW1CO2dCQUNwQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xELEtBQUssZ0JBQWdCO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDdkQsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDTixJQUFLLEdBQWlDLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ2pELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztxQkFDSSxJQUFLLEdBQWdDLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2pELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ00sYUFBYSxDQUFJLEdBQTBCLEVBQUUsVUFBeUIsRUFBRSxLQUEyQjtRQUN0RyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixLQUFLLE1BQU0sUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxLQUFLLE1BQU0sUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELE9BQU8sTUFBd0IsQ0FBQztJQUNwQyxDQUFDO0lBQ1MsTUFBTSxDQUFDLEdBQWdCO1FBQzdCLElBQUksR0FBRyxZQUFZLHNCQUFzQixFQUFFLENBQUM7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE9BQU8sR0FBRyxZQUFZLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBQ1MsbUJBQW1CLENBQUMsR0FBOEIsRUFBRSxLQUEyQjtRQUNyRixHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRCxHQUFHLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZGLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxHQUFHLENBQUMsV0FBVyxZQUFZLHNCQUFzQixFQUFFLENBQUM7Z0JBQ3BELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2xFLEdBQUcsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7Z0JBQzNDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQUksR0FBRyxDQUFDLFlBQVksWUFBWSxzQkFBc0IsRUFBRSxDQUFDO2dCQUNyRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNuRSxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2dCQUM3QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLENBQUM7WUFDRCxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNYLE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9FLENBQUM7WUFFRCxPQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxHQUFHLENBQUMsV0FBVyxZQUFZLGlCQUFpQixFQUFFLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQWdDLENBQUM7WUFDeEQsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLFlBQVksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEMsV0FBVyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQ2pELE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0gsQ0FBQzthQUNJLElBQUksR0FBRyxDQUFDLFlBQVksWUFBWSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3JELE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxZQUFpQyxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxZQUFZLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDcEQsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUNsRCxPQUFPLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDUyxpQkFBaUIsQ0FBSSxHQUE4QixFQUFFLEtBQTJCO1FBQ3RGLEdBQUcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLFlBQVksZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUE2QixDQUFDO1FBRTFELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLFVBQVUsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbkUsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsbUZBQW1GO1FBQ25GLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUN0QyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BELFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ2hCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFDdEIsQ0FBQztnQkFDRCxPQUFPLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWIsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDWCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDeEUsQ0FBQztZQUVELE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDeEIsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ3pHLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDUyxrQkFBa0IsQ0FBSSxHQUErQixFQUFFLEtBQTJCO1FBQ3hGLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBUSxDQUFDO1FBQzVELEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9GLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEUsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLGdCQUFnQixJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ25FLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxZQUFZLHNCQUFzQixFQUFFLENBQUM7b0JBQ3RDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEQsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUN0QixDQUFDO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFYixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkYsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ1MsV0FBVyxDQUF1QixHQUFpQyxFQUFFLEtBQTJCO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLFdBQVcsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ25FLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsVUFBVSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsTUFBTSxJQUFJLGFBQWEsWUFBWSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN2RCxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQW9CLENBQUMsQ0FBQztnQkFDL0csSUFBSSxrQkFBa0IsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO29CQUNoSixJQUFJLE1BQU0sWUFBWSxnQkFBZ0IsSUFBSSxNQUFNLFlBQVksZ0JBQWdCLEVBQUUsQ0FBQzt3QkFDM0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxVQUFVLGdCQUFnQixDQUFDLENBQUM7b0JBQ2xGLENBQUM7b0JBRUQsTUFBTSxHQUFHLElBQUksd0JBQXdCLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsVUFBaUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3BELGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDO1lBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakYsSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDVCxPQUFPLE1BQU0sQ0FBQztnQkFDbEIsQ0FBQztnQkFDRCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzNFLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ1YsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzlDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDM0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBRXBELFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNsQixLQUFLLFNBQVMsQ0FBQzt3QkFDZixLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ2IsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQ3RGLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzt3QkFDMUQsQ0FBQzt3QkFDRDs0QkFDSSxDQUFDO2dDQUNHLElBQUksUUFBUSxHQUFhLE1BQU0sQ0FBQztnQ0FDaEMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRSxDQUFDO29DQUNwRCxRQUFRLEdBQUcsT0FBTyxDQUFDO2dDQUN2QixDQUFDO2dDQUVELFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dDQUNqRSxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7NEJBQzFELENBQUM7b0JBQ1QsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFrQyxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFvQixDQUFDLENBQUM7WUFDMUksSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBRXBFLElBQUksWUFBWSxZQUFZLHdCQUF3QixFQUFFLENBQUM7b0JBQ25ELEtBQUssTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNsQyxHQUFHLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztvQkFDMUQsQ0FBQztvQkFDRCxTQUFTLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRUQsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2xCLEtBQUssU0FBUyxDQUFDO29CQUNmLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDYixNQUFNLEtBQUssR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hDLGFBQWEsQ0FBQyxNQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFpQixFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFDN0UsT0FBTyxZQUFZLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUN2RSxDQUFDO29CQUNELE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ04sTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUVoQyxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7d0JBQ25FLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsWUFBWSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLFlBQVksaUJBQWlCLENBQUMsRUFBRSxDQUFDOzRCQUNuSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDM0MsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2pDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDO3dCQUM1QyxDQUFDO3dCQUVELElBQUksWUFBWSxDQUFDLFlBQVksS0FBSyxNQUFNLEVBQUUsQ0FBQzs0QkFDdkMsS0FBSyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQzs0QkFDekQsT0FBTyxLQUFLLENBQUM7d0JBQ2pCLENBQUM7d0JBQ0QsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUN4QixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQzthQUNJLElBQUksYUFBYSxZQUFZLGdCQUFnQixJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDaEYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRixDQUFDO2FBQ0ksSUFBSSxhQUFhLFlBQVksaUJBQWlCLEVBQUUsQ0FBQztZQUNsRCxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUM7Z0JBQ2pDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3RCLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNsQixLQUFLLFNBQVMsQ0FBQzt3QkFDZixLQUFLLFNBQVMsQ0FBQzt3QkFDZixLQUFLLGVBQWUsQ0FBQyxDQUFDLENBQUM7NEJBQ25CLE9BQU8sTUFBTSxDQUFDO3dCQUNsQixDQUFDO3dCQUNELE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBQ04sTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7NEJBQ3hELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQzdCLFVBQVUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQy9CLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUVqRCxhQUFhLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQ25FLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQ3ZHLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQzt3QkFDM0IsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7YUFDSSxJQUFJLGFBQWEsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO1lBQ3ZELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoRSxHQUFHLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7WUFDM0MsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0UsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLFVBQVUsQ0FBQztZQUNmLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVwRCxJQUFJLGFBQWEsWUFBWSxlQUFlLEVBQUUsQ0FBQztnQkFDM0MsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQWlCLENBQUMsQ0FBQztnQkFDakYsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLGdCQUFnQixJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNuRSxPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQWlCLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLGdCQUFnQixJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNuRSxPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO1lBQ0wsQ0FBQztZQUVELGdEQUFnRDtZQUNoRCxJQUFJLGdCQUFnQixFQUFFLENBQUM7Z0JBQ25CLElBQUksR0FBRyxDQUFDLGFBQWEsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUN0RCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNwRSxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO29CQUMvQyxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0UsQ0FBQztnQkFFRCxPQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsVUFBVSw4Q0FBOEMsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFDUyxXQUFXLENBQWdDLEdBQWtDLEVBQUUsS0FBMkI7UUFDaEgsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQztRQUV4QyxJQUFJLGFBQWEsWUFBWSxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVDLElBQUksYUFBYSxHQUFHLGFBQWlDLENBQUM7WUFDdEQsUUFBUSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDYixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQztvQkFDcEQsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQTBCLENBQUM7b0JBQzFELE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNwRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ2xHLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7b0JBRXJELElBQUksU0FBUyxZQUFZLGdCQUFnQixFQUFFLENBQUM7d0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztvQkFDakcsQ0FBQztvQkFFRCxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUM7b0JBQ3BCLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7d0JBQ3pCLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7d0JBQ3hDLElBQUksY0FBYyxLQUFLLGFBQWEsRUFBRSxDQUFDOzRCQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7d0JBQzlFLENBQUM7d0JBRUQsV0FBVyxDQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2pELHlDQUF5Qzt3QkFDekMsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGNBQThCLENBQUM7d0JBQ2hFLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDN0MsQ0FBQzt5QkFDSSxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUM5QixHQUFHLEdBQUcsU0FBUyxDQUFDO29CQUNwQixDQUFDO3lCQUNJLENBQUM7d0JBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDcEYsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN2QyxHQUFHLEdBQUcsTUFBTSxDQUFDO29CQUNqQixDQUFDO29CQUVELE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUM3RCxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQixjQUFjLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQzt3QkFDbEMsVUFBVSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7b0JBQy9DLENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO29CQUN4QyxDQUFDO29CQUVELE9BQU8sVUFBVSxDQUFDO2dCQUN0QixDQUFDO2dCQUNELEtBQUssUUFBUSxDQUFDO2dCQUNkLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUN6RCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssb0JBQW9CLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN4RSxDQUFDO29CQUVELE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxZQUFZLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssWUFBWSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDO29CQUNqSyxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFFaEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUUsSUFBSSxVQUFpQyxDQUFDO29CQUN0QyxJQUFJLGFBQWEsWUFBWSxrQkFBa0IsRUFBRSxDQUFDO3dCQUM5QyxVQUFVLEdBQUcsYUFBYSxDQUFDO29CQUMvQixDQUFDO3lCQUNJLElBQUksYUFBYSxZQUFZLHFCQUFxQixFQUFFLENBQUM7d0JBQ3RELFVBQVUsR0FBRywwQkFBMEIsQ0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUF1QixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xJLENBQUM7b0JBRUQsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3BHLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFFaEcsSUFBSSxTQUFTLEtBQUssYUFBYSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQzt3QkFDbEQsSUFBSSxhQUFhLFlBQVksaUJBQWlCLEVBQUUsQ0FBQzs0QkFDN0MsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQ3JDLENBQUM7d0JBRUQsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRSxDQUFDOzRCQUM5QixJQUFJLFNBQVMsWUFBWSxnQkFBZ0IsRUFBRSxDQUFDO2dDQUN4QyxzQ0FBc0M7Z0NBQ3RDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0NBRTFELE1BQU0sTUFBTSxHQUFHLElBQUkscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQzdDLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDbEUsS0FBSyxNQUFNLE1BQU0sSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDO29DQUM5RCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUM7Z0NBQ2hELENBQUM7Z0NBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dDQUN6RCxNQUFNLGdCQUFnQixHQUFHLElBQUksb0JBQW9CLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0NBQ2pGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFzQixDQUFDO2dDQUM1RSxhQUFhLEdBQUcsVUFBVSxDQUFDOzRCQUMvQixDQUFDO2lDQUNJLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0NBQzlCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0NBQ2xDLGdFQUFnRTtnQ0FDaEUsaUVBQWlFO2dDQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsSUFBSSxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUM7b0NBQzNELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUM7b0NBQy9DLFFBQVEsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO29DQUNwQyxTQUFTLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztvQ0FDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQTJCLENBQUMsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNsRixLQUFLLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3Q0FDOUMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3Q0FDekYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7b0NBQ3BDLENBQUM7b0NBQ0QsVUFBVSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7b0NBQ3pDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0NBQzFELGFBQWEsR0FBRyxRQUFRLENBQUM7Z0NBQzdCLENBQUM7cUNBQ0ksQ0FBQztvQ0FDRiw0RUFBNEU7b0NBQzVFLGFBQWEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dDQUM3RSxDQUFDOzRCQUNMLENBQUM7aUNBQ0ksQ0FBQztnQ0FDRixlQUFlO2dDQUNmLElBQUksa0JBQWtCLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssWUFBWSxFQUFFLENBQUM7b0NBQ3BFLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7b0NBQy9DLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29DQUNsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO29DQUV2RCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO29DQUMzQixhQUFhLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7b0NBQ3pELElBQUksU0FBK0IsQ0FBQztvQ0FDcEMsS0FBSyxNQUFNLElBQUksSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7d0NBQzNDLElBQUksV0FBVyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt3Q0FDL0YsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRDQUNmLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dDQUN2QyxDQUFDO3dDQUNELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dDQUNoRSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQ0FDbEYsQ0FBQztvQ0FDRCxhQUFhLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7b0NBQ3pELGFBQWEsR0FBRyxjQUFjLENBQUM7b0NBRS9CLFNBQVMsR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dDQUNsRCxDQUFDO2dDQUVELElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0NBQ3pCLElBQUksYUFBYSxZQUFZLGlCQUFpQixJQUFJLGFBQWEsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7d0NBQ2hGLGFBQWEsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO3dDQUN6QyxhQUFhLENBQUMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0NBQ3hDLENBQUM7eUNBQ0ksQ0FBQzt3Q0FDRixJQUFJLE1BQU0sR0FBRyxTQUE4QixDQUFDO3dDQUM1QyxhQUFhLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO3dDQUN4RixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDOzRDQUM1QyxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3Q0FDbkcsQ0FBQzt3Q0FDRCxhQUFhLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQzt3Q0FDdEMsYUFBYSxDQUFDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29DQUNyQyxDQUFDO2dDQUNMLENBQUM7cUNBQ0ksSUFBSSxTQUFTLFlBQVksaUJBQWlCLEVBQUUsQ0FBQztvQ0FDOUMsT0FBTztnQ0FDWCxDQUFDO3FDQUNJLENBQUM7b0NBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0NBQ3RHLGFBQWEsQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO29DQUN0QyxhQUFhLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ3JDLENBQUM7NEJBQ0wsQ0FBQzt3QkFDTCxDQUFDOzZCQUNJLENBQUM7NEJBQ0YsSUFBSSxDQUFDLENBQUMsU0FBUyxZQUFZLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztnQ0FDM0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxvRkFBb0YsQ0FBQyxDQUFDOzRCQUNsSixDQUFDOzRCQUNELGFBQWEsR0FBRyxXQUFXLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO3dCQUM5RSxDQUFDO3dCQUVELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQzdCLHlCQUF5Qjs0QkFDekIsc0VBQXNFOzRCQUN0RSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO3dCQUMzQyxDQUFDO29CQUNMLENBQUM7b0JBRUQsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBaUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUMxRixJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNQLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ25ELENBQUM7b0JBRUQsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsS0FBSyxTQUFTLENBQUM7Z0JBQ2YsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNiLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDL0IsYUFBYSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBQy9CLENBQUM7b0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQy9CLE1BQU0sVUFBVSxHQUFHLE9BQWdDLENBQUM7d0JBQ3BELE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNwRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3BGLENBQUM7b0JBQ0QsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNYLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxlQUFlLElBQUksYUFBYSxZQUFZLGlCQUFpQixFQUFFLENBQUM7d0JBQ2hGLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQy9DLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNsRCxJQUFJLFFBQThCLENBQUM7d0JBQ25DLEtBQUssTUFBTSxTQUFTLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDMUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUN2RixNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDbEUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7d0JBQy9FLENBQUM7d0JBQ0QsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUNuRCxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUM5QixDQUFDO29CQUVELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFnQyxDQUFDO29CQUNqRSxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUM3RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUF5QixDQUFDO29CQUUxSCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7d0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksdURBQXVELENBQUMsQ0FBQztvQkFDckgsQ0FBQztvQkFFRCxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNqQyxPQUFPLGFBQWEsQ0FBQztnQkFDekIsQ0FBQztnQkFDRCxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2Qsb0dBQW9HO29CQUNwRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxJQUFJLE1BQTRCLENBQUM7b0JBQ2pDLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUM1QixhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDOUIsYUFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBcUIsQ0FBQyxDQUFDO3dCQUN0RixhQUFhLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzt3QkFDcEMsT0FBTyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN2RSxDQUFDO29CQUVELElBQUksYUFBYSxDQUFDLFFBQVEsS0FBSyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN2RCxJQUFJLGFBQWEsQ0FBQyxNQUFNLFlBQVksZ0JBQWdCLEVBQUUsQ0FBQzs0QkFDbkQsS0FBSyxNQUFNLFVBQVUsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dDQUMzRCxNQUFNLENBQUMsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQ0FDM0csTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZELENBQUM7d0JBQ0wsQ0FBQzs2QkFDSSxDQUFDOzRCQUNGLEtBQUssTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQ0FDN0MsTUFBTSxDQUFDLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0NBQzdGLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzVFLENBQUM7b0JBRUQsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2pHLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7Z0JBQ0QsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNkLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLG9CQUFvQixHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDeEUsQ0FBQztvQkFFRCxhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDOUIsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNiLElBQUksVUFBOEIsQ0FBQztvQkFDbkMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRSxDQUFDO3dCQUM5QixVQUFVLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDeEUsQ0FBQztvQkFDRCxNQUFNLFNBQVMsR0FBRyxVQUFVLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ3ZGLElBQUksU0FBUyxFQUFFLENBQUM7d0JBQ1osTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDM0IsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQzt3QkFDeEMsYUFBYSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBRTVCLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ2hELFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDekMsU0FBUyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7d0JBQ3ZCLGFBQWEsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO3dCQUNsQyxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzt3QkFFM0IsSUFBSSxXQUFXLEdBQXlCLElBQUksQ0FBQzt3QkFDN0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQzFDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzdDLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUM1RCxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDeEYsQ0FBQzt3QkFDRCxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3ZELGFBQWEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO3dCQUMxQixJQUFJLFVBQVUsRUFBRSxDQUFDOzRCQUNiLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzQyxDQUFDO29CQUNMLENBQUM7b0JBRUQsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQWdDLENBQUM7b0JBQ3ZELE1BQU0sTUFBTSxHQUF1QixFQUFFLENBQUM7b0JBQ3RDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7d0JBQy9CLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUF1QixDQUFDO3dCQUMzRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBb0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxlQUFlLENBQWlCLEtBQUssQ0FBQyxDQUFDO3dCQUN4SSxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDcEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBc0IsQ0FBQzt3QkFFdkgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSx5REFBeUQsQ0FBQyxDQUFDO3dCQUN2SCxDQUFDO3dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7NEJBQ1IsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLFNBQVMsRUFBRSxTQUFTLENBQUMsS0FBSzt5QkFDN0IsQ0FBQyxDQUFDO29CQUNQLENBQUM7b0JBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUNwQixhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNuQyxDQUFDO29CQUNELE9BQU8sYUFBYSxDQUFDO2dCQUN6QixDQUFDO2dCQUNELEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDWCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUErQixFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3hJLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxjQUE4QixDQUFDO29CQUMvRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFLENBQUM7d0JBQzlCLHNCQUFzQjt3QkFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ3JHLGFBQWEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDakMsYUFBYSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7d0JBQ3RDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUM5QixPQUFPLGFBQWEsQ0FBQztvQkFDekIsQ0FBQzt5QkFDSSxJQUFJLGFBQWEsWUFBWSxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxZQUFZLGlCQUFpQixDQUFDLEVBQUUsQ0FBQzt3QkFDbEgsa0NBQWtDO3dCQUNsQyxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQ3JELGFBQWEsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUMvQixDQUFDO3dCQUNELE9BQU8sUUFBUSxDQUFDO29CQUNwQixDQUFDO3lCQUNJLENBQUM7d0JBQ0YsMERBQTBEO3dCQUMxRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM3QyxJQUFJLFNBQVMsRUFBRSxDQUFDOzRCQUNaLEtBQUssTUFBTSxNQUFNLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUM7NEJBQ2hELENBQUM7d0JBQ0wsQ0FBQzt3QkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDOUQsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQzVCLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNoRyxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDMUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTlCLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDOzRCQUM5QyxrREFBa0Q7NEJBQ2xELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7NEJBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUVyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzs0QkFDakUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7NEJBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOzRCQUVwQixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOzRCQUM3QixhQUFhLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUM5RCxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUNqQyw4QkFBOEI7NEJBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFFL0Usd0RBQXdEOzRCQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUNwRixNQUFNLFlBQVksR0FBRyxJQUFJLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUM3RyxZQUFZLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs0QkFFaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDL0MsaUNBQWlDOzRCQUNqQyxJQUFJLG9CQUEwQyxDQUFDOzRCQUMvQyxLQUFLLE1BQU0sVUFBVSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0NBQ3BELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQ0FDdEQsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQ2hHLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUMvRCxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzs0QkFDbkgsQ0FBQzs0QkFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDOUQsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7NEJBRWpDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUNsRSxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFFeEMsT0FBTyxZQUFZLENBQUM7d0JBQ3hCLENBQUM7d0JBRUQsT0FBTyxNQUFNLENBQUM7b0JBQ2xCLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxLQUFLLEtBQUssQ0FBQztnQkFDWCxLQUFLLEtBQUssQ0FBQztnQkFDWCxLQUFLLEtBQUssQ0FBQztnQkFDWCxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ1QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUN6RCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssb0JBQW9CLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN4RSxDQUFDO29CQUVELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUF1QixDQUFDO3dCQUN2RCxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDakcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFxQixDQUFDO3dCQUNySSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO3dCQUVyRCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7NEJBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksaURBQWlELENBQUMsQ0FBQzt3QkFDM0csQ0FBQzt3QkFFRCxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7b0JBQ3JDLENBQUM7b0JBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUEwQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDekksSUFBSSxDQUFDLFlBQVksd0JBQXdCLEVBQUUsQ0FBQzs0QkFDeEMsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDO3dCQUN4QixDQUFDO3dCQUNELE9BQU8sQ0FBQyxDQUFDO29CQUNiLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN0QixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsY0FBOEIsQ0FBQztvQkFDL0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRSxDQUFDO3dCQUM5QixzQkFBc0I7d0JBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQXdCLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN6RyxhQUFhLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2pDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUM5QixPQUFPLGFBQWEsQ0FBQztvQkFDekIsQ0FBQzt5QkFDSSxJQUFJLGFBQWEsWUFBWSxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxZQUFZLGlCQUFpQixDQUFDLEVBQUUsQ0FBQzt3QkFDbEgsT0FBTyxZQUFZLENBQUM7b0JBQ3hCLENBQUM7eUJBQ0ksQ0FBQzt3QkFDRiwwREFBMEQ7d0JBQzFELE1BQU0sTUFBTSxHQUFHLElBQUkscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzdDLElBQUksU0FBUyxFQUFFLENBQUM7NEJBQ1osS0FBSyxNQUFNLE1BQU0sSUFBSSxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQzs0QkFDaEQsQ0FBQzt3QkFDTCxDQUFDO3dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUM5RCxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ3BHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUMxQixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFFOUIsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7NEJBQzlDLGtEQUFrRDs0QkFDbEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQzs0QkFDdEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBRXJDLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQWdCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDOzRCQUNqRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7NEJBRXBCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQzdCLGFBQWEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQzlELFVBQVUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQ2pDLDhCQUE4Qjs0QkFDOUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUUvRSx3REFBd0Q7NEJBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxNQUFtQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDMUgsTUFBTSxZQUFZLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDN0csWUFBWSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7NEJBRWhDLE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQy9DLGlDQUFpQzs0QkFDakMsSUFBSSxvQkFBMEMsQ0FBQzs0QkFDL0MsS0FBSyxNQUFNLFVBQVUsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dDQUNwRCxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7Z0NBQ3RELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dDQUNoRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDL0Qsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7NEJBQ25ILENBQUM7NEJBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzlELGFBQWEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOzRCQUVqQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDbEUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBRXhDLE9BQU8sWUFBWSxDQUFDO3dCQUN4QixDQUFDO3dCQUVELE9BQU8sTUFBTSxDQUFDO29CQUNsQixDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsS0FBSyxLQUFLLENBQUM7Z0JBQ1gsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNULElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLG9CQUFvQixHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDeEUsQ0FBQztvQkFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQztvQkFDdkMsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUNoRCxDQUFDO29CQUVELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUF1QixDQUFDO3dCQUN0RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQ1QsV0FBVyxHQUFHLElBQUksa0JBQWtCLENBQUMsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNwSCxDQUFDO3dCQUNELE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNqRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQzVGLENBQUM7b0JBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFDLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxjQUE4QixDQUFDO29CQUMvRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFLENBQUM7d0JBQzlCLHNCQUFzQjt3QkFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ25HLGFBQWEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDakMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25ELGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUM5QixJQUFJLGFBQWEsWUFBWSxpQkFBaUIsRUFBRSxDQUFDOzRCQUM3QyxhQUFhLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDckMsQ0FBQzt3QkFDRCxPQUFPLGFBQWEsQ0FBQztvQkFDekIsQ0FBQzt5QkFDSSxJQUFJLGFBQWEsWUFBWSxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxZQUFZLGlCQUFpQixDQUFDLEVBQUUsQ0FBQzt3QkFDbEgsa0NBQWtDO3dCQUNsQyxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQ3JELGFBQWEsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUMvQixDQUFDO3dCQUNELE9BQU8sTUFBTSxDQUFDO29CQUNsQixDQUFDO3lCQUNJLENBQUM7d0JBQ0YsMERBQTBEO3dCQUMxRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM3QyxJQUFJLFNBQVMsRUFBRSxDQUFDOzRCQUNaLEtBQUssTUFBTSxNQUFNLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLENBQUM7NEJBQ2hELENBQUM7d0JBQ0wsQ0FBQzt3QkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDOUQsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQzVCLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUM5RixNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDMUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTlCLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDOzRCQUM5QyxrREFBa0Q7NEJBQ2xELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7NEJBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUVyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzs0QkFDakUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7NEJBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOzRCQUVwQixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOzRCQUM3QixhQUFhLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUM5RCxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUNqQyw4QkFBOEI7NEJBQzlCLElBQUksaUJBQWlCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQzdELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQ0FDVCxpQkFBaUIsR0FBRyxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzRCQUM3RCxDQUFDOzRCQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFFNUQsd0RBQXdEOzRCQUN4RCxJQUFJLGlCQUF1QyxDQUFDOzRCQUM1QyxJQUFJLEtBQUssRUFBRSxDQUFDO2dDQUNSLGlCQUFpQixHQUFHLElBQUksd0JBQXdCLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDM0ksQ0FBQztpQ0FDSSxDQUFDO2dDQUNGLGlCQUFpQixHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDeEksQ0FBQzs0QkFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUM3RyxZQUFZLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs0QkFFaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDL0MsaUNBQWlDOzRCQUNqQyxJQUFJLG9CQUEwQyxDQUFDOzRCQUMvQyxLQUFLLE1BQU0sVUFBVSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0NBQ3BELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztnQ0FDdEQsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQ2hHLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUMvRCxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzs0QkFDbkgsQ0FBQzs0QkFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDOUQsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7NEJBRWpDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUNsRSxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFFeEMsT0FBTyxJQUFJLHFCQUFxQixDQUFDLFlBQVksRUFBRSxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzRSxDQUFDO3dCQUVELE1BQU0sU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDaEosT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEgsQ0FBQztnQkFDTCxDQUFDO2dCQUNELEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDWCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDeEIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQXVCLENBQUM7d0JBQ3hELE1BQU0sVUFBVSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNwRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLE9BQWMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQy9GLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3pELENBQUM7b0JBRUQsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRSxDQUFDO3dCQUM5QixhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkQsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7d0JBQ3ZDLE1BQU0sUUFBUSxHQUFJLGFBQWtDLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQzdELFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDeEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBRXZCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUV0QyxvQ0FBb0M7d0JBQ3BDLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxjQUE4QixDQUFDO3dCQUMvRCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO3dCQUUvQyxJQUFJLE9BQTZCLENBQUM7d0JBQ2xDLEtBQUssTUFBTSxNQUFNLElBQUksZUFBZSxFQUFFLENBQUM7NEJBQ25DLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQy9GLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ25HLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUNqRSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDNUUsQ0FBQzt3QkFFRCxJQUFJLFFBQThCLENBQUM7d0JBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQ2xFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNoRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3BFLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLGFBQWEsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7d0JBQ3BKLENBQUM7d0JBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDOUQsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7NEJBQ3hDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDOzRCQUM1QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDdkgsUUFBUSxHQUFHLElBQUksWUFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLGFBQWEsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUMxSCxDQUFDO3dCQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7d0JBQ3JDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFFeEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUNyRyxNQUFNLFdBQVcsR0FBRyxJQUFJLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFFckcsSUFBSSxNQUFtQixDQUFDO3dCQUN4QixJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzs0QkFDNUMsTUFBTSxHQUFHLElBQUkscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ3ZDLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQ0FDNUMsTUFBZ0MsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDakUsQ0FBQzt3QkFDTCxDQUFDOzZCQUNJLENBQUM7NEJBQ0YsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNwRCxDQUFDO3dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUN6RCxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDNUIsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUVqQyw4Q0FBOEM7d0JBQzlDLElBQUksWUFBa0MsQ0FBQzt3QkFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDbEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUMvRCxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDM0YsQ0FBQzt3QkFFRCxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3ZELFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEYsQ0FBQztvQkFDRCxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQ0QsS0FBSyxNQUFNLENBQUM7Z0JBQ1osS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNWLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQy9FLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUUsQ0FBQzt3QkFDOUIsSUFBSSxhQUFhLFlBQVksaUJBQWlCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQzNFLGlFQUFpRTs0QkFDakUsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDbkQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUN6QyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQzlDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOzRCQUN4QixTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDMUIsYUFBYSxHQUFHLFNBQVMsQ0FBQzs0QkFFMUIsSUFBSSxRQUE4QixDQUFDOzRCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dDQUMvRCxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUMzQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN0QyxNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQ0FDbEUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7NEJBQy9FLENBQUM7NEJBRUQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN4RCxDQUFDO3dCQUVELElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxNQUFNLEVBQUUsQ0FBQzs0QkFDNUIsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dDQUM1QixhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksc0JBQXNCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0NBQy9HLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUMvRSxDQUFDOzRCQUNELGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDdEosQ0FBQzs2QkFDSSxDQUFDOzRCQUNGLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM1TCxDQUFDO29CQUNMLENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixJQUFJLFdBQVcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUN6RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ2YsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQzs0QkFDdkMsTUFBTSxRQUFRLEdBQUksYUFBa0MsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDN0QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUN4QyxRQUFRLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs0QkFDdkIsUUFBUSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7NEJBRXRCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUV0QyxvQ0FBb0M7NEJBQ3BDLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUM7NEJBQy9DLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7NEJBRS9DLElBQUksT0FBNkIsQ0FBQzs0QkFDbEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUUsQ0FBQztnQ0FDbkMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDL0YsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDbkcsTUFBTSxVQUFVLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0NBQ2pFLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDOzRCQUM1RSxDQUFDOzRCQUVELElBQUksUUFBOEIsQ0FBQzs0QkFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQ0FDbEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2hELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNwRCxNQUFNLFlBQVksR0FBRyxJQUFJLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQ0FDcEUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksYUFBYSxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQzs0QkFDcEosQ0FBQzs0QkFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dDQUM5RCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQ0FDeEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0NBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dDQUN2SCxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksYUFBYSxDQUFDLElBQUkscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQzFILENBQUM7NEJBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs0QkFDckMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzRCQUV4RSxNQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQzFHLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUUxRyxJQUFJLE1BQW1CLENBQUM7NEJBQ3hCLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dDQUM1QyxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQ0FDdkMsS0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO29DQUM1QyxNQUFnQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUNqRSxDQUFDOzRCQUNMLENBQUM7aUNBQ0ksQ0FBQztnQ0FDRixNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQ3BELENBQUM7NEJBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQzlELGFBQWEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOzRCQUNqQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFFeEMsOENBQThDOzRCQUM5QyxJQUFJLFlBQWtDLENBQUM7NEJBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0NBQ2xFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzNDLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUN4RCxNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQ0FDL0QsWUFBWSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7NEJBQzNGLENBQUM7NEJBRUQsV0FBVyxHQUFHLElBQUksa0JBQWtCLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7NEJBQzFGLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUN0QyxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQzt3QkFDL0MsQ0FBQzt3QkFFRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBMEIsQ0FBQzt3QkFDeEQsTUFBTSxRQUFRLEdBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBK0IsQ0FBQyxVQUFVLENBQUM7d0JBRTVHLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxNQUFNLEVBQUUsQ0FBQzs0QkFDNUIsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM5SCxDQUFDOzZCQUNJLENBQUM7NEJBQ0YsV0FBVyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM1SCxDQUFDO3dCQUVELFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO3dCQUN2QixJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDcEIsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzdFLENBQUM7d0JBQ0QsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7NEJBQ2xCLE1BQU0sY0FBYyxHQUFHLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDMUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7d0JBQzVHLENBQUM7b0JBQ0wsQ0FBQztvQkFFRCxPQUFPLGFBQWEsQ0FBQztnQkFDekIsQ0FBQztnQkFDRCxLQUFLLE9BQU8sQ0FBQztnQkFDYixLQUFLLFdBQVcsQ0FBQztnQkFDakIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNaLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLG9CQUFvQixHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDeEUsQ0FBQztvQkFFRCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsY0FBYyxDQUFDO29CQUNwRCxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDcEcsTUFBTSxrQkFBa0IsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBUSxDQUFDO29CQUMxRixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO29CQUVyRCxJQUFJLFNBQTRCLENBQUM7b0JBQ2pDLFFBQVEsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNyQixLQUFLLE9BQU87NEJBQ1IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUN2RCxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQUMsYUFBYSxFQUFFLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxDQUFDOzRCQUNsRixNQUFNO3dCQUNWLEtBQUssV0FBVzs0QkFDWixTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzs0QkFDdkUsTUFBTTt3QkFDVixLQUFLLFFBQVE7NEJBQ1QsU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7NEJBQ3BFLE1BQU07b0JBQ2QsQ0FBQztvQkFDRCxhQUFhLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDaEQsYUFBYSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO29CQUNuRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3hDLElBQUksY0FBYyxFQUFFLENBQUM7d0JBQ2pCLGNBQWMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO3dCQUNyQyxhQUFhLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztvQkFDbEQsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7b0JBQzNDLENBQUM7b0JBQ0QsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsS0FBSyxXQUFXLENBQUM7Z0JBQ2pCLEtBQUssVUFBVSxDQUFDO2dCQUNoQixLQUFLLFdBQVcsQ0FBQztnQkFDakIsS0FBSyxVQUFVLENBQUM7Z0JBQ2hCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQztvQkFDcEQsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDNUYsTUFBTSxrQkFBa0IsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBUSxDQUFDO29CQUUxRixJQUFJLFNBQW1CLENBQUM7b0JBQ3hCLFFBQVEsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNyQixLQUFLLFdBQVcsQ0FBQzt3QkFDakIsS0FBSyxVQUFVOzRCQUNYLFNBQVMsR0FBRyxNQUFNLENBQUM7NEJBQ25CLE1BQU07d0JBQ1YsS0FBSyxXQUFXOzRCQUNaLFNBQVMsR0FBRyxPQUFPLENBQUM7NEJBQ3BCLE1BQU07d0JBQ1YsS0FBSyxVQUFVOzRCQUNYLFNBQVMsR0FBRyxNQUFNLENBQUM7NEJBQ25CLE1BQU07d0JBQ1Y7NEJBQ0ksU0FBUyxHQUFHLE9BQU8sQ0FBQzs0QkFDcEIsTUFBTTtvQkFDZCxDQUFDO29CQUVELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQWdDLENBQUM7b0JBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBRS9JLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxXQUFXLEVBQUUsQ0FBQzt3QkFDakMsa0JBQWtCLENBQUMsY0FBYyxHQUFHLElBQUksWUFBWSxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ2pILENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixhQUFhLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDbkUsQ0FBQztvQkFFRCxNQUFNLGdCQUFnQixHQUF5QixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7b0JBQ2xHLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUF1QixDQUFDO29CQUMzRCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO29CQUM3SCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDbEcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QixJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQixjQUFjLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQzt3QkFDckMsYUFBYSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7b0JBQ2xELENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO29CQUMzQyxDQUFDO29CQUVELE9BQU8sYUFBYSxDQUFDO2dCQUN6QixDQUFDO2dCQUNELEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3hFLENBQUM7b0JBRUQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQztvQkFDcEQsTUFBTSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztvQkFDNUYsTUFBTSxrQkFBa0IsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBUSxDQUFDO29CQUMxRixhQUFhLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFekQsTUFBTSxnQkFBZ0IsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO29CQUNsRyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBdUIsQ0FBQztvQkFDM0QsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUMvSCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzlCLElBQUksY0FBYyxFQUFFLENBQUM7d0JBQ2pCLGNBQWMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO3dCQUNyQyxhQUFhLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztvQkFDbEQsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7b0JBQzNDLENBQUM7b0JBRUQsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNYLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLG9CQUFvQixHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDeEUsQ0FBQztvQkFFRCxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsY0FBYyxDQUFDO29CQUVwRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBdUIsQ0FBQztvQkFDdkQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQXVCLENBQUM7b0JBRXBELFVBQVU7b0JBQ1YsSUFBSSxVQUFVLEdBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2xHLE1BQU0sUUFBUSxHQUFzQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFRLENBQUM7b0JBQ3BJLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7b0JBRXJELE1BQU0sT0FBTyxHQUFJLFVBQVUsQ0FBQyxJQUFtQyxDQUFDLE1BQU0sQ0FBQztvQkFDdkUsTUFBTSxPQUFPLEdBQUksT0FBTyxDQUFDLElBQW1DLENBQUMsTUFBTSxDQUFDO29CQUNwRSxNQUFNLFFBQVEsR0FBbUMsRUFBRSxDQUFDO29CQUNwRCxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sRUFBRSxDQUFDO3dCQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzVHLENBQUM7b0JBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQzt3QkFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkMsQ0FBQztvQkFFRCxTQUFTO29CQUNULE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQWtCLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQy9GLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztvQkFDekUsVUFBVSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ25FLE1BQU0sZ0JBQWdCLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQVEsQ0FBQztvQkFDckksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDckQsYUFBYSxHQUFHLGdCQUFnQixDQUFDO29CQUVqQyxJQUFJLGNBQWMsRUFBRSxDQUFDO3dCQUNqQixjQUFjLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQzt3QkFDckMsYUFBYSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7b0JBQ2xELENBQUM7eUJBQ0ksQ0FBQzt3QkFDRixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO29CQUMzQyxDQUFDO29CQUNELE9BQU8sYUFBYSxDQUFDO2dCQUN6QixDQUFDO2dCQUNELEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDYixJQUFJLGFBQWEsWUFBWSxpQkFBaUIsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDO3dCQUMxQyxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUMvQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbEQsU0FBUyxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBRXJJLElBQUksUUFBOEIsQ0FBQzt3QkFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDM0IsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUN6RCxLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDakMsTUFBTSxRQUFRLEdBQUcsR0FBRyxZQUFZLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ3JKLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUM1RCxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDL0UsQ0FBQzt3QkFDRCxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzlDLE9BQU8sU0FBUyxDQUFDO29CQUNyQixDQUFDO29CQUNELE9BQU8sYUFBYSxDQUFDO2dCQUN6QixDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7YUFDSSxDQUFDO1lBQ0YsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFN0csTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixJQUFJLGtCQUF1QixDQUFDO1lBQzVCLElBQUksbUJBQW1CLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDO2dCQUN0QixJQUFJLENBQUMsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEQsQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMvQiw0QkFBNEI7Z0JBQ2hDLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFlBQVksZUFBZSxFQUFFLENBQUM7b0JBQy9CLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxVQUFnQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO2dCQUM5QixVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLFVBQVUsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ25FLE9BQU8sR0FBRyxDQUFDO2dCQUNmLENBQUM7WUFDTCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ25GLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDbkUsT0FBTyxHQUFHLENBQUM7Z0JBQ2YsQ0FBQztZQUNMLENBQUM7WUFFRCxnREFBZ0Q7WUFDaEQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLGFBQWEsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUN0RCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNwRSxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO29CQUMvQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixDQUFDO2dCQUNELEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDakMsSUFBSSxDQUFDLFlBQVksc0JBQXNCLEVBQUUsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNwRCxRQUFRLEdBQUcsSUFBSSxDQUFDO3dCQUNoQixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ3RCLENBQUM7b0JBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRWIsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDWCxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0UsQ0FBQztnQkFFRCxPQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQWMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25JLElBQUksUUFBUSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsbUZBQW1GO2dCQUNuRixNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BELFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDbkcsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsaUJBQWlCLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsNkJBQTZCO0lBQ25CLGtCQUFrQixDQUFpRCxVQUFvQyxFQUFFLEtBQTJCO1FBQzFJLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQztRQUMvQyxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsQixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDbkIsTUFBTTtZQUNWLENBQUM7WUFDRCxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osTUFBTTtZQUNWLENBQUM7WUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNOLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNuQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekUsQ0FBQztnQkFDRCxPQUFPLFVBQVUsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxTQUFTLFlBQVksaUJBQWlCLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUVuQyxJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUM7UUFDL0IsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBQy9CLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsY0FBYyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxjQUFjLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUV0RCxJQUFJLFNBQVMsWUFBWSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLFNBQXNCLENBQUM7Z0JBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQzNCLGFBQWEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7b0JBQzFDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzNDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO29CQUN6QixhQUFhLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ2xELEtBQUssQ0FBQyxjQUFjLEdBQUksWUFBWSxDQUFDLGNBQWtDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RixDQUFDO3FCQUNJLENBQUM7b0JBQ0YsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUVELGNBQWMsR0FBRyxJQUFJLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDL0MsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekQsS0FBSyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQXNCLEVBQUUsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFDO1FBQ3hDLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25DLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsTUFBTSxhQUFhLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDO1lBQ25GLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUUzQyxJQUFJLE1BQU0sWUFBWSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNaLElBQUksTUFBTSxZQUFZLGlCQUFpQixJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssY0FBYyxFQUFFLENBQUM7d0JBQzlFLE1BQU0sY0FBYyxHQUFHLGNBQW1DLENBQUM7d0JBQzNELE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDOUMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQzt3QkFDMUMsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBRXBDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQzlCLGFBQWEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLFFBQThCLENBQUM7d0JBQ25DLEtBQUssTUFBTSxJQUFJLElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUM1QyxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQy9GLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUM3RCxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzt3QkFDL0UsQ0FBQzt3QkFDRCxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNqRixjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDM0IsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDcEUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzNCLENBQUM7Z0JBQ0wsQ0FBQztxQkFDSSxDQUFDO29CQUNGLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDcEUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLENBQUM7WUFDTCxDQUFDO2lCQUNJLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLElBQUksTUFBTSxLQUFLLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDbkMsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUM5QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUMxQyxXQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDcEMsSUFBSSxRQUE4QixDQUFDO29CQUNuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDNUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUMxRixNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDN0QsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBQy9FLENBQUM7b0JBQ0QsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDakYsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTyxDQUFDO29CQUN0QyxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzNFLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUMzQixJQUFJLFNBQTRCLENBQUM7Z0JBQ2pDLHVDQUF1QztnQkFDdkMsSUFBSSxNQUFNLFlBQVksd0JBQXdCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUM3RixTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckksQ0FBQztxQkFDSSxDQUFDO29CQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQzNCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNwQyxJQUFJLE1BQU0sWUFBWSx3QkFBd0IsRUFBRSxDQUFDO3dCQUM3QyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2RCxDQUFDO29CQUNELFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNuQyxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDbEMsQ0FBQztnQkFDRCxJQUFJLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUIsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksd0JBQXdCLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN0RywyQ0FBMkM7Z0JBQzNDLElBQUksTUFBTSxZQUFZLG9CQUFvQixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQ25FLFNBQVMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUNqQyxDQUFDO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNMLENBQUM7UUFFRCxjQUFjLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNqQyxjQUFjLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUNuQyxjQUFjLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQztRQUMzQyxJQUFJLGNBQWMsWUFBWSxpQkFBaUIsRUFBRSxDQUFDO1lBQzlDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUksU0FBK0IsQ0FBQztZQUNwQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNsRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDaEUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDbEYsQ0FBQztZQUNELFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxDQUFDO0lBQ1MsY0FBYyxDQUFJLEdBQTJCLEVBQUUsS0FBMkI7UUFDaEYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLE1BQU0sWUFBWSxTQUFTLEVBQUUsQ0FBQztZQUM5QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBcUIsQ0FBQztZQUM5RCxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUM3QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEQsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQzthQUNJLElBQUksTUFBTSxZQUFZLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO2FBQ0ksSUFBSSxNQUFNLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDL0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQXlCLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pHLGFBQWEsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFlLENBQUM7WUFFbkMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQztZQUMzRCxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDakIsYUFBYSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6RCxDQUFDO1lBQ0QsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFFcEUsa0JBQWtCO1lBQ2xCLE1BQU0sY0FBYyxHQUFHLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUN2RixNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDNUQsUUFBUSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUN4RCxRQUFRLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUMxQiw0QkFBNEI7WUFDNUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFMUMsSUFBSSxhQUFhLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDbEIsS0FBSyxNQUFNLElBQUksSUFBSSxhQUFhLEVBQUUsQ0FBQzt3QkFDL0IsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNwQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDOzRCQUN2QixNQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7NEJBQ3hELEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7NEJBQ3pDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOzRCQUNwQixjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDckMsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO3dCQUMvQixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RDLElBQUksU0FBUyxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs0QkFDeEUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFDcEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOzRCQUN4RCxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOzRCQUN6QyxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDcEIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3JDLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDOUQsUUFBUSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztnQkFDeEQsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUYsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xGLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQzdCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV4RCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQy9GLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7YUFDSSxJQUFJLE1BQU0sWUFBWSxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztZQUNwRiw2REFBNkQ7WUFDN0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLGNBQThCLENBQUM7WUFDbEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdCLHlCQUF5QjtZQUN6QixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXdDLENBQUM7WUFDbkUsS0FBSyxNQUFNLE1BQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNqRyxDQUFDO1lBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNsSCxDQUFDO1lBQ0QsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO2FBQ0ksSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUM1QixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO2FBQ0ksQ0FBQztZQUNGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN6QixPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRSxDQUFDO0lBQ0wsQ0FBQztJQUNTLG9CQUFvQixDQUFDLEdBQTJCLEVBQUUsS0FBMkI7UUFDbkYsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsR0FBRyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxSCxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksR0FBRyxDQUFDLGNBQWMsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO2dCQUN2RCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNyRSxHQUFHLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO2dCQUNqRCxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLENBQUM7WUFDRCxJQUFJLEdBQUcsQ0FBQyxXQUFXLFlBQVksc0JBQXNCLEVBQUUsQ0FBQztnQkFDcEQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbEUsR0FBRyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztnQkFDM0MsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixDQUFDO1lBQ0QsSUFBSSxHQUFHLENBQUMsWUFBWSxZQUFZLHNCQUFzQixFQUFFLENBQUM7Z0JBQ3JELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ25FLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7Z0JBQzdDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDL0UsQ0FBQztZQUNELE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDUyxrQkFBa0IsQ0FBQyxHQUE2QixFQUFFLEtBQTJCO1FBQ25GLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTdDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLElBQUksR0FBRyxDQUFDLE9BQU8sWUFBWSxzQkFBc0IsRUFBRSxDQUFDO2dCQUNoRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUNuQyxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBQ0QsT0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELElBQUksR0FBRyxDQUFDLE9BQU8sWUFBWSxpQkFBaUIsRUFBRSxDQUFDO1lBQzNDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUE0QixDQUFDO1lBQ3BELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxZQUFZLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDL0MsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUM3QyxPQUFPLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUVKO0FBRUQsTUFBTSxhQUFhLEdBQUcsQ0FBa0IsUUFBa0MsRUFBRSxTQUFvQyxFQUFFLElBQVksRUFBRSxZQUE4QixFQUFFLEVBQUU7SUFDOUosSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQStDLENBQUM7SUFDekUsT0FBTyxTQUFTLElBQUssU0FBaUIsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDMUYsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUF3QyxDQUFDO1FBQzFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEgsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxRQUEwQixFQUFFLElBQXVCLEVBQUUsV0FBcUIsRUFBRSxFQUFFO0lBQy9GLElBQUksSUFBSSxZQUFZLGlCQUFpQixFQUFFLENBQUM7UUFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQUksUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3BCLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxNQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO0lBQ3BDLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUN6QixPQUFPLFNBQVMsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLGNBQWMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDL0ssTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGNBQThCLENBQUM7UUFDekQsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDO0lBQ0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztJQUN6QyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQzdCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQixrRUFBa0U7WUFDbEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixhQUFhLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNQLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7WUFFN0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDckIsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25DLFVBQVUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2SCxDQUFDO1lBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzdCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUYsQ0FBQztZQUVELElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNyQixRQUFRLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLENBQUM7UUFDTCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakYsQ0FBQztJQUNMLENBQUM7SUFDRCxRQUFRLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUNsQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUNELFFBQVEsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QyxPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDLENBQUMifQ==