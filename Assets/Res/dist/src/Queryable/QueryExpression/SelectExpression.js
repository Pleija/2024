import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { resolveTreeClone } from "../../Helper/ExpressionUtil";
import { hashCode, hashCodeAdd, isColumnExp, resolveClone, visitExpression } from "../../Helper/Util";
import { EmbeddedRelationMetaData } from "../../MetaData/EmbeddedColumnMetaData";
import { RelationMetaData } from "../../MetaData/Relation/RelationMetaData";
import { IncludeRelation } from "../Interface/IncludeRelation";
import { JoinRelation } from "../Interface/JoinRelation";
import { EntityExpression } from "./EntityExpression";
import { ProjectionEntityExpression } from "./ProjectionEntityExpression";
import { QueryExpression } from "./QueryExpression";
export class SelectExpression extends QueryExpression {
    get allColumns() {
        let columns = this.entity.columns.union(this.resolvedSelects);
        for (const join of this.joins) {
            const child = join.child;
            columns = child.entity.columns.union(child.resolvedSelects);
        }
        for (const include of this.includes.where((o) => o.isEmbedded)) {
            const child = include.child;
            columns = child.entity.columns.union(child.resolvedSelects);
        }
        return columns;
    }
    /**
     * All select expressions used.
     */
    get allSelects() {
        return [this].union(this.joins.selectMany((o) => o.child.allSelects));
    }
    get itemType() {
        return this.itemExpression.type;
    }
    get primaryKeys() {
        return this.entity.primaryColumns;
    }
    get projectedColumns() {
        if (this.isSelectOnly) {
            return this.selects;
        }
        if (this.distinct) {
            return this.relationColumns.union(this.resolvedSelects);
        }
        // primary column used in hydration to identify an entity.
        // relation column used in hydration to build relationship.
        let projectedColumns = this.primaryKeys.union(this.relationColumns);
        if (this.entity instanceof EntityExpression && this.entity.versionColumn && this.entity.metaData.concurrencyMode === "OPTIMISTIC VERSION") {
            // Version column for optimistic concurency.
            projectedColumns = projectedColumns.union([this.entity.versionColumn]);
        }
        projectedColumns = projectedColumns.union(this.resolvedSelects);
        return projectedColumns;
    }
    get relationColumns() {
        // Include Relation Columns are used later for hydration
        let relations = this.includes.where((o) => !o.isEmbedded).selectMany((o) => o.parentColumns);
        if (this.parentRelation) {
            // relation column might cames from child join columns
            relations = relations.union(this.parentRelation.childColumns);
        }
        return relations;
    }
    get resolvedIncludes() {
        return this.includes.selectMany((o) => {
            if (o.isEmbedded) {
                return o.child.resolvedIncludes;
            }
            else {
                return [o];
            }
        });
    }
    get resolvedJoins() {
        let joins = this.joins;
        for (const include of this.includes.where((o) => o.isEmbedded)) {
            joins = joins.union(include.child.resolvedJoins);
        }
        return joins;
    }
    get resolvedSelects() {
        return this.selects.union(this.includes
            .selectMany((o) => o.isEmbedded ? o.child.resolvedSelects : o.parentColumns));
    }
    constructor(entity) {
        super();
        this.includes = [];
        // TODO: remove this workaround for insertInto Expression
        this.isSelectOnly = false;
        this.joins = [];
        this.orders = [];
        this.paging = {};
        this.selects = [];
        this.type = Array;
        if (entity) {
            this.entity = entity;
            this.itemExpression = entity;
            if (entity instanceof ProjectionEntityExpression) {
                this.selects = entity.columns.slice();
            }
            else {
                this.selects = entity.columns.where((o) => o.columnMeta && o.columnMeta.isProjected).toArray();
            }
            entity.select = this;
        }
    }
    addInclude(name, child, relationMetaOrRelations, type, isEmbedded) {
        let relation;
        if (relationMetaOrRelations instanceof RelationMetaData) {
            const relationMeta = relationMetaOrRelations;
            if (relationMeta.completeRelationType === "many-many") {
                // add bridge (a.k.a relation data) and include child select to it.
                const relDataEntityExp = new EntityExpression(relationMeta.relationData.type, relationMeta.relationData.name, true);
                const relDataExp = new SelectExpression(relDataEntityExp);
                // predicate that identify relation between bridge and child.
                let bridgeRelation;
                let bridgeRelationMap = (relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                for (const [relColMeta, parentColMeta] of bridgeRelationMap) {
                    const parentCol = this.entity.columns.first((o) => o.propertyName === parentColMeta.propertyName);
                    const relationCol = relDataExp.entity.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(parentCol, relationCol);
                    bridgeRelation = bridgeRelation ? new AndExpression(bridgeRelation, logicalExp) : logicalExp;
                }
                this.addInclude(name, relDataExp, bridgeRelation, "many");
                // add relation from this to bridge.
                bridgeRelationMap = (!relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                bridgeRelation = null;
                for (const [relColMeta, childColMeta] of bridgeRelationMap) {
                    const bridgeCol = relDataEntityExp.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const childCol = child.entity.columns.first((o) => o.propertyName === childColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(bridgeCol, childCol);
                    bridgeRelation = bridgeRelation ? new AndExpression(bridgeRelation, logicalExp) : logicalExp;
                }
                const result = relDataExp.addInclude(name, child, bridgeRelation, "one");
                return result;
            }
            for (const [parentColMeta, childColMeta] of relationMeta.relationMaps) {
                const parentCol = this.entity.columns.first((o) => o.propertyName === parentColMeta.propertyName);
                const childCol = child.entity.columns.first((o) => o.propertyName === childColMeta.propertyName);
                const logicalExp = new StrictEqualExpression(parentCol, childCol);
                relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
            }
            type = relationMeta.relationType;
        }
        else if (relationMetaOrRelations instanceof EmbeddedRelationMetaData) {
            type = relationMetaOrRelations.relationType;
            relation = new ValueExpression(true);
            isEmbedded = true;
        }
        else {
            relation = relationMetaOrRelations;
        }
        const includeRel = new IncludeRelation(this, child, name, type, relation);
        includeRel.isEmbedded = isEmbedded;
        child.parentRelation = includeRel;
        this.includes.push(includeRel);
        return includeRel;
    }
    addJoin(child, relationMetaOrRelations, type, isEmbedded) {
        const existingRelation = this.joins.first((o) => o.child === child);
        if (existingRelation) {
            return existingRelation;
        }
        let relation;
        if (relationMetaOrRelations instanceof RelationMetaData) {
            const relationMeta = relationMetaOrRelations;
            if (relationMeta.completeRelationType === "many-many") {
                // add bridge (a.k.a relation data) and join child select to it.
                const relDataEntityExp = new EntityExpression(relationMeta.relationData.type, relationMeta.relationData.name, true);
                const relDataExp = new SelectExpression(relDataEntityExp);
                relDataExp.distinct = true;
                // predicate that identify relation between bridge and child.
                let bridgeRelation;
                let bridgeRelationMap = (relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                for (const [relColMeta, parentColMeta] of bridgeRelationMap) {
                    const parentCol = this.entity.columns.first((o) => o.propertyName === parentColMeta.propertyName);
                    const relationCol = relDataExp.entity.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(parentCol, relationCol);
                    bridgeRelation = bridgeRelation ? new AndExpression(bridgeRelation, logicalExp) : logicalExp;
                }
                this.addJoin(relDataExp, bridgeRelation, "LEFT");
                // add relation from this to bridge.
                bridgeRelationMap = (!relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                bridgeRelation = null;
                for (const [relColMeta, childColMeta] of bridgeRelationMap) {
                    const bridgeCol = relDataEntityExp.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const childCol = child.entity.columns.first((o) => o.propertyName === childColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(bridgeCol, childCol);
                    bridgeRelation = bridgeRelation ? new AndExpression(bridgeRelation, logicalExp) : logicalExp;
                }
                const result = relDataExp.addJoin(child, bridgeRelation, "INNER");
                return result;
            }
            const isReverse = relationMeta.source.type !== this.entity.type;
            const relType = isReverse ? relationMeta.reverseRelation.relationType : relationMeta.relationType;
            for (const [parentColMeta, childColMeta] of relationMeta.relationMaps) {
                const parentCol = this.entity.columns.first((o) => o.propertyName === (isReverse ? childColMeta : parentColMeta).propertyName);
                const childCol = child.entity.columns.first((o) => o.propertyName === (isReverse ? parentColMeta : childColMeta).propertyName);
                const logicalExp = new StrictEqualExpression(parentCol, childCol);
                relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
            }
            type = relType === "one" && type ? type : "LEFT";
        }
        else if (relationMetaOrRelations instanceof EmbeddedRelationMetaData) {
            type = "INNER";
            relation = new ValueExpression(true);
            isEmbedded = true;
        }
        else {
            relation = relationMetaOrRelations;
        }
        const joinRel = new JoinRelation(this, child, relation, type);
        joinRel.isEmbedded = isEmbedded;
        child.parentRelation = joinRel;
        this.joins.push(joinRel);
        return joinRel;
    }
    //#endregion
    //#region Methods
    addWhere(expression) {
        if (this.isSubSelect) {
            if (expression instanceof AndExpression) {
                this.addWhere(expression.leftOperand);
                this.addWhere(expression.rightOperand);
                return;
            }
            let isRelationFilter = false;
            visitExpression(expression, (exp) => {
                if (exp.entity) {
                    const colExp = exp;
                    if (colExp.entity !== this.entity) {
                        isRelationFilter = true;
                        return false;
                    }
                }
            });
            if (isRelationFilter) {
                this.parentRelation.relation = this.parentRelation.relation ? new AndExpression(this.parentRelation.relation, expression) : expression;
                return;
            }
        }
        this.where = this.where ? new AndExpression(this.where, expression) : expression;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const entity = resolveClone(this.entity, replaceMap);
        const clone = new SelectExpression(entity);
        replaceMap.set(this, clone);
        clone.itemExpression = resolveClone(this.itemExpression, replaceMap);
        clone.selects = this.selects.select((o) => resolveClone(o, replaceMap)).toArray();
        clone.orders = this.orders.select((o) => ({
            column: resolveClone(o.column, replaceMap),
            direction: o.direction
        })).toArray();
        clone.joins = this.joins.select((o) => {
            return o.clone(replaceMap);
        }).toArray();
        clone.includes = this.includes.select((o) => {
            return o.clone(replaceMap);
        }).toArray();
        clone.distinct = this.distinct;
        clone.where = resolveClone(this.where, replaceMap);
        clone.parameterTree = resolveTreeClone(this.parameterTree, replaceMap);
        Object.assign(clone.paging, this.paging);
        return clone;
    }
    getEffectedEntities() {
        return this.entity.entityTypes
            .union(this.joins.selectMany((o) => o.child.getEffectedEntities()))
            .union(this.includes.selectMany((o) => o.child.getEffectedEntities()))
            .distinct().toArray();
    }
    getItemExpression() {
        if (isColumnExp(this.itemExpression)) {
            return this.itemExpression;
        }
        return this.entity;
    }
    hashCode() {
        let code = hashCode("SELECT", hashCode(this.entity.name, this.distinct ? 1 : 0));
        code = hashCodeAdd(code, this.selects.select((o) => o.hashCode()).sum());
        if (this.where) {
            code = hashCodeAdd(this.where.hashCode(), code);
        }
        code = hashCodeAdd(code, this.joins.sum((o) => o.child.hashCode()));
        code = hashCodeAdd(code, this.includes.sum((o) => o.child.hashCode()));
        return code;
    }
    setOrder(expression, direction) {
        if (!Array.isArray(expression)) {
            expression = [{
                    column: expression,
                    direction: direction
                }];
        }
        this.orders = expression;
    }
    toString() {
        return `Select({
Entity:${this.entity.toString()},
Select:${this.selects.select((o) => o.toString()).toArray().join(",")},
Where:${this.where ? this.where.toString() : ""},
Join:${this.joins.select((o) => o.child.toString()).toArray().join(",")},
Include:${this.includes.select((o) => o.child.toString()).toArray().join(",")}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vU2VsZWN0RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFFakYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdEcsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRS9ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUt0RCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHcEQsTUFBTSxPQUFPLGdCQUEwQixTQUFRLGVBQW9CO0lBQy9ELElBQVcsVUFBVTtRQUNqQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlELEtBQUssTUFB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