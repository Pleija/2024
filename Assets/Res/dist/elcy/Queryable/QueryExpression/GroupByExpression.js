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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBCeUV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9Hcm91cEJ5RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFFakYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkgsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRS9ELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXhELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELE1BQU0sT0FBTyxpQkFBMkIsU0FBUSxnQkFBbUI7SUFDL0QsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQ2xDLENBQUM7SUFDRCxJQUFXLE1BQU0sQ0FBQyxLQUFLO1FBQ25CLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQyxDQUFDO0lBQ0wsQ0FBQztJQUNELElBQVcsT0FBTztRQUNkLE9BQU8sSUFBSSxDQUFD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QztJQUNNLFFBQVE7UUFDWCxPQUFPO1NBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7U0FDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtPQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7R0FDL0MsQ0FBQztJQUNBLENBQUM7Q0FDSiJ9