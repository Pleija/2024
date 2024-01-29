import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { hashCode, hashCodeAdd, isColumnExp, isEntityExp, resolveClone, visitExpression } from "../../Helper/Util";
import { IncludeRelation } from "../Interface/IncludeRelation";
import { ComputedColumnExpression } from "./ComputedColumnExpression";
import { GroupedExpression } from "./GroupedExpression";
import { SelectExpression } from "./SelectExpression";
export class GroupByExpression extends SelectExpression {
    get allColumns() {
        return this.groupBy.union(super.allColumns);
    }
    get entity() {
        return this.itemSelect.entity;
    }
    set entity(value) {
        if (this.itemSelect) {
            this.itemSelect.entity = value;
        }
    }
    get groupBy() {
        return this.itemSelect.groupBy;
    }
    get includes() {
        return this.itemSelect.includes;
    }
    set includes(value) {
        if (this.itemSelect) {
            this.itemSelect.includes = value;
        }
    }
    get isSubSelect() {
        return this.itemSelect.isSubSelect;
    }
    set isSubSelect(value) {
        if (this.itemSelect) {
            this.itemSelect.isSubSelect = value;
        }
    }
    get itemExpression() {
        return this.itemSelect.itemExpression;
    }
    set itemExpression(value) {
        if (this.itemSelect) {
            this.itemSelect.itemExpression = value;
        }
    }
    get joins() {
        return this.itemSelect.joins;
    }
    set joins(value) {
        if (this.itemSelect) {
            this.itemSelect.joins = value;
        }
    }
    get key() {
        return this.itemSelect.key;
    }
    set key(value) {
        this.itemSelect.key = value;
    }
    get orders() {
        return this.itemSelect.orders;
    }
    set orders(value) {
        if (this.itemSelect) {
            this.itemSelect.orders = value;
        }
    }
    get paging() {
        return this.itemSelect.paging;
    }
    set paging(value) {
        if (this.itemSelect) {
            this.itemSelect.paging = value;
        }
    }
    get parameterTree() {
        return this.itemSelect.parameterTree;
    }
    set parameterTree(value) {
        if (this.itemSelect) {
            this.itemSelect.parameterTree = value;
        }
    }
    get parentRelation() {
        return this.itemSelect.parentRelation;
    }
    set parentRelation(value) {
        if (this.itemSelect) {
            this.itemSelect.parentRelation = value;
        }
    }
    get primaryKeys() {
        return this.groupBy;
    }
    get projectedColumns() {
        if (this.isAggregate) {
            return this.relationColumns.union(this.resolvedSelects);
        }
        return this.itemSelect.projectedColumns;
    }
    get relationColumns() {
        return this.itemSelect.relationColumns;
    }
    get resolvedGroupBy() {
        if (isEntityExp(this.key)) {
            const keyEntities = Array.from(this.key.select.allSelects.select((o) => o.entity));
            const groupBy = this.groupBy.slice();
            for (const column of this.selects.ofType(ComputedColumnExpression).where((o) => !groupBy.any((g) => g.dataPropertyName === o.dataPropertyName))) {
                visitExpression(column.expression, (exp) => {
                    if (isColumnExp(exp) && keyEntities.contains(exp.entity)) {
                        groupBy.push(exp);
                    }
                });
            }
            return groupBy;
        }
        return this.groupBy;
    }
    get resolvedIncludes() {
        let includes = super.resolvedIncludes;
        if (!this.isAggregate && this.keyRelation) {
            if (this.keyRelation.isEmbedded) {
                includes = this.keyRelation.child.resolvedIncludes.union(includes);
            }
            else {
                includes = ([this.keyRelation]).union(includes);
            }
        }
        return includes;
    }
    get resolvedJoins() {
        let join = super.resolvedJoins;
        if (this.keyRelation && this.keyRelation.isEmbedded && (!this.parentRelation || !this.parentRelation.isEmbedded)) {
            join = this.keyRelation.child.resolvedJoins.union(join);
        }
        return join;
    }
    get resolvedSelects() {
        const selects = this.isAggregate ? this.selects.asEnumerable() : this.itemSelect.selects.asEnumerable();
        // parentColumns ??
        return selects.union(this.includes.where((o) => o.isEmbedded)
            .selectMany((o) => o.child.resolvedSelects));
    }
    get where() {
        return this.itemSelect.where;
    }
    set where(value) {
        if (this.itemSelect) {
            this.itemSelect.where = value;
        }
    }
    constructor(select, key) {
        super();
        if (select) {
            this.itemSelect = new GroupedExpression(select, key);
            this.entity.select = this.itemSelect.groupByExp = this;
            this.selects = this.groupBy.slice();
            for (const include of select.includes) {
                this.addInclude(include.name, include.child, include.relation, include.type);
            }
            for (const join of select.joins) {
                this.addJoin(join.child, join.relation, join.type);
            }
            const parentRel = select.parentRelation;
            if (parentRel) {
                parentRel.child = this;
                this.parentRelation = parentRel;
                select.parentRelation = null;
            }
            if (isEntityExp(key)) {
                // set key parent relation to this.
                const selectExp = key.select;
                const keyParentRel = selectExp.parentRelation;
                if (keyParentRel) {
                    let relation;
                    for (const col of this.groupBy) {
                        const childCol = selectExp.projectedColumns.first((o) => o.propertyName === col.propertyName);
                        const logicalExp = new StrictEqualExpression(col, childCol);
                        relation = relation ? new AndExpression(relation, logicalExp) : logicalExp;
                    }
                    this.addKeyRelation(selectExp, relation, "one");
                    this.keyRelation.isEmbedded = keyParentRel.isEmbedded;
                }
            }
        }
    }
    addKeyRelation(child, relation, type) {
        const includeRel = new IncludeRelation(this, child, "key", type, relation);
        child.parentRelation = includeRel;
        this.keyRelation = includeRel;
        return includeRel;
    }
    addWhere(expression) {
        this.having = this.having ? new AndExpression(this.having, expression) : expression;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const selectClone = resolveClone(this.itemSelect, replaceMap);
        const clone = new GroupByExpression();
        replaceMap.set(this, clone);
        clone.itemSelect = selectClone;
        selectClone.groupByExp = clone;
        clone.having = resolveClone(this.having, replaceMap);
        clone.selects = this.selects.select((o) => resolveClone(o, replaceMap)).toArray();
        clone.itemExpression = resolveClone(this.itemExpression, replaceMap);
        clone.isAggregate = this.isAggregate;
        return clone;
    }
    getItemExpression() {
        if (this.isAggregate) {
            return this.itemSelect.getItemExpression();
        }
        return this.itemSelect;
    }
    hashCode() {
        let code = super.hashCode();
        code = hashCodeAdd(hashCode("GROUPBY", code), this.groupBy.select((o) => o.hashCode()).sum());
        if (this.having) {
            code = hashCodeAdd(this.having.hashCode(), code);
        }
        return code;
    }
    toString() {
        return `GroupBy({
Entity:${this.entity.toString()},
Select:${this.selects.select((o) => o.toString()).toArray().join(",")},
Where:${this.where ? this.where.toString() : ""},
Join:${this.joins.select((o) => o.child.toString()).toArray().join(",")},
Include:${this.includes.select((o) => o.child.toString()).toArray().join(",")},
Group:${this.groupBy.select((o) => o.toString()).toArray().join(",")},
Having:${this.having ? this.having.toString() : ""}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBCeUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0dyb3VwQnlFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUVqRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuSCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFL0QsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFeEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQsTUFBTSxPQUFPLGlCQUEyQixTQUFRLGdCQUFtQjtJQUMvRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDbEMsQ0FBQztJQUNELElBQVcsTUFBTSxDQUFDLEtBQUs7UUFDbkIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBVyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMs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