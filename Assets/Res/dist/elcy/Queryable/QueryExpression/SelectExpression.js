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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL1NlbGVjdEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBRWpGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3RHLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRWpGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFLdEQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR3BELE1BQU0sT0FBTyxnQkFBMEIsU0FBUSxlQUFvQjtJQUMvRCxJQUFXLFVBQVU7UUFDakIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RCxLQUFLLE1B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