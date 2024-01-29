import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { resolveTreeClone } from "../../Helper/ExpressionUtil";
import { hashCode, resolveClone } from "../../Helper/Util";
import { RelationMetaData } from "../../MetaData/Relation/RelationMetaData";
import { EntityExpression } from "./EntityExpression";
import { QueryExpression } from "./QueryExpression";
import { SelectExpression } from "./SelectExpression";
export class DeleteExpression extends QueryExpression {
    get entity() {
        return this.select.entity;
    }
    get joins() {
        return this.select.joins;
    }
    get orders() {
        return this.select.orders;
    }
    get paging() {
        return this.select.paging;
    }
    get type() {
        return undefined;
    }
    get where() {
        return this.select.where;
    }
    constructor(selectOrEntity, mode) {
        super();
        this.mode = mode;
        this.includes = [];
        if (!(selectOrEntity instanceof SelectExpression)) {
            selectOrEntity = new SelectExpression(selectOrEntity);
        }
        this.select = selectOrEntity;
        for (const o of this.select.includes) {
            const childDeleteExp = new DeleteExpression(o.child, this.mode);
            this.addInclude(childDeleteExp, o.relation);
        }
        this.select.includes = [];
        this.parameterTree = this.select.parameterTree;
    }
    addInclude(child, relationMetaOrRelations) {
        let relations;
        if (relationMetaOrRelations instanceof RelationMetaData) {
            const relationMeta = relationMetaOrRelations;
            if (relationMeta.completeRelationType === "many-many") {
                // include to relationSelect
                let relMap = (relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                const relationDatExp = new EntityExpression(relationMeta.relationData.type, relationMeta.relationData.name, true);
                const relationDelete = new DeleteExpression(relationDatExp, this.mode);
                for (const [relColMeta, parentColMeta] of relMap) {
                    const parentCol = this.entity.columns.first((o) => o.propertyName === parentColMeta.propertyName);
                    const relationCol = relationDelete.entity.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(parentCol, relationCol);
                    relations = relations ? new AndExpression(relations, logicalExp) : logicalExp;
                }
                relationDelete.parentRelation = {
                    child: relationDelete,
                    parent: this,
                    relations: relations
                };
                this.includes.push(relationDelete.parentRelation);
                // include child to relationSelect
                relations = null;
                relMap = (!relationMeta.isMaster ? relationMeta.relationData.sourceRelationMaps : relationMeta.relationData.targetRelationMaps);
                for (const [relColMeta, childColMeta] of relMap) {
                    const relationCol = relationDelete.entity.columns.first((o) => o.propertyName === relColMeta.propertyName);
                    const childCol = child.entity.columns.first((o) => o.propertyName === childColMeta.propertyName);
                    const logicalExp = new StrictEqualExpression(relationCol, childCol);
                    relations = relations ? new AndExpression(relations, logicalExp) : logicalExp;
                }
                child.parentRelation = {
                    child,
                    parent: relationDelete,
                    relations: relations
                };
                relationDelete.includes.push(child.parentRelation);
                return child.parentRelation;
            }
            relations = null;
            for (const [parentColMeta, childColMeta] of relationMeta.relationMaps) {
                const parentCol = this.entity.columns.first((o) => o.propertyName === parentColMeta.propertyName);
                const childCol = child.entity.columns.first((o) => o.propertyName === childColMeta.propertyName);
                const logicalExp = new StrictEqualExpression(parentCol, childCol);
                relations = relations ? new AndExpression(relations, logicalExp) : logicalExp;
            }
        }
        else {
            relations = relationMetaOrRelations;
        }
        child.parentRelation = {
            child,
            parent: this,
            relations: relations
        };
        this.includes.push(child.parentRelation);
        return child.parentRelation;
    }
    addJoin(child, relationMetaOrRelations, type) {
        return this.select.addJoin(child, relationMetaOrRelations, type);
    }
    addWhere(expression) {
        this.select.addWhere(expression);
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const select = resolveClone(this.select, replaceMap);
        const clone = new DeleteExpression(select, this.mode);
        clone.parameterTree = resolveTreeClone(this.parameterTree, replaceMap);
        replaceMap.set(this, clone);
        return clone;
    }
    getEffectedEntities() {
        return this.entity.entityTypes
            .union(this.entity.metaData.relations
            .where((o) => o.isMaster && (o.reverseRelation.deleteOption !== "NO ACTION" && o.reverseRelation.deleteOption !== "RESTRICT"))
            .select((o) => o.target.type))
            .union(this.includes.selectMany((o) => o.child.getEffectedEntities())).distinct().toArray();
    }
    hashCode() {
        return hashCode("DELETE", hashCode(this.mode, this.select.hashCode()));
    }
    setOrder(expression, direction) {
        this.select.setOrder(expression, direction);
    }
    toString() {
        return `Delete({
Entity:${this.entity.toString()},
Where:${this.where ? this.where.toString() : ""},
Mode:${this.mode}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0RlbGV0ZUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBRWpGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFFNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBT3RELE1BQU0sT0FBTyxnQkFBMEIsU0FBUSxlQUFxQjtJQUNoRSxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBNkIsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsSUFBVyxLQUFLO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxJQUFJO1FBQ1gsT0FBTyxTQUFnQixDQUFDO0lBQzVCLENBQUM7SUFDRCxJ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