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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vRGVsZXRlRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFFakYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUd0RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFPdEQsTUFBTSxPQUFPLGdCQUEwQixTQUFRLGVBQXFCO0lBQ2hFLElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUE2QixDQUFDO0lBQ3JELENBQUM7SUFDRCxJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLElBQUk7UUFDWCxPQUFPLFNBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUNELElB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