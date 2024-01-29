import { ObjectValueExpression } from "../../ExpressionBuilder/Expression/ObjectValueExpression";
import { hashCode, isEntityExp, mapReplaceExp, resolveClone } from "../../Helper/Util";
import { SelectExpression } from "./SelectExpression";
export class GroupedExpression extends SelectExpression {
    get allColumns() {
        return this.groupBy.union(super.allColumns);
    }
    get groupBy() {
        if (!this._groupBy) {
            this._groupBy = [];
            if (isEntityExp(this.key)) {
                const entityExp = this.key;
                const childSelectExp = entityExp.select;
                if (childSelectExp.parentRelation) {
                    const parentRel = childSelectExp.parentRelation;
                    if (parentRel.isEmbedded) {
                        const cloneMap = new Map();
                        mapReplaceExp(cloneMap, entityExp, this.entity);
                        const childSelects = childSelectExp.resolvedSelects.select((o) => {
                            let curCol = this.entity.columns.first((c) => c.propertyName === o.propertyName && c.constructor === o.constructor);
                            if (!curCol) {
                                curCol = o.clone(cloneMap);
                            }
                            return curCol;
                        });
                        this._groupBy = childSelects.toArray();
                    }
                    else {
                        this._groupBy = parentRel.parentColumns.slice();
                    }
                }
            }
            else if (this.key instanceof ObjectValueExpression) {
                for (const prop in this.key.object) {
                    this._groupBy.push(this.key.object[prop]);
                }
            }
            else {
                const column = this.key;
                this._groupBy.push(column);
            }
        }
        return this._groupBy;
    }
    get projectedColumns() {
        return super.projectedColumns.union(this.groupBy);
    }
    constructor(select, key) {
        super();
        if (select) {
            this.key = key;
            this.itemExpression = this.entity = select.entity;
            this.selects = select.selects.slice();
            this.distinct = select.distinct;
            // this.isAggregate = select.isAggregate;
            this.where = select.where;
            this.orders = select.orders.slice();
            Object.assign(this.paging, select.paging);
            this.isSubSelect = select.isSubSelect;
            this.parameterTree = {
                node: select.parameterTree.node.slice(),
                childrens: select.parameterTree.childrens.slice()
            };
        }
    }
    addJoin(child, relationMetaOrRelations, type, isEmbedded) {
        const joinRel = super.addJoin(child, relationMetaOrRelations, type, isEmbedded);
        joinRel.parent = this.groupByExp;
        return joinRel;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const entity = resolveClone(this.entity, replaceMap);
        const clone = new GroupedExpression();
        replaceMap.set(this, clone);
        clone.entity = entity;
        if (this.key.primaryColumns) {
            const entityExp = this.key;
            const relKeyClone = entityExp.select.parentRelation.clone(replaceMap);
            clone.key = relKeyClone.child.entity;
        }
        else {
            clone.key = resolveClone(this.key, replaceMap);
        }
        clone.itemExpression = resolveClone(this.itemExpression, replaceMap);
        clone.selects = this.selects.select((o) => resolveClone(o, replaceMap)).toArray();
        clone.orders = this.orders.select((o) => ({
            column: resolveClone(o.column, replaceMap),
            direction: o.direction
        })).toArray();
        clone.joins = this.joins.select((o) => o.clone(replaceMap)).toArray();
        clone.includes = this.includes.select((o) => o.clone(replaceMap)).toArray();
        clone.where = resolveClone(this.where, replaceMap);
        clone.parameterTree = {
            node: this.parameterTree.node.select((o) => replaceMap.has(o) ? replaceMap.get(o) : o).toArray(),
            childrens: this.parameterTree.childrens.slice()
        };
        Object.assign(clone.paging, this.paging);
        return clone;
    }
    hashCode() {
        return hashCode("GROUPED", super.hashCode());
    }
    toString() {
        return `Grouped({
Entity:${this.entity.toString()},
Select:${this.selects.select((o) => o.toString()).toArray().join(",")},
Where:${this.where ? this.where.toString() : ""},
Join:${this.joins.select((o) => o.child.toString()).toArray().join(",")},
Include:${this.includes.select((o) => o.child.toString()).toArray().join(",")}
})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBlZEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9Hcm91cGVkRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNdkYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHdEQsTUFBTSxPQUFPLGlCQUEyQixTQUFRLGdCQUFtQjtJQUMvRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELElBQVcsT0FBTztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUF3QixDQUFDO2dCQUNoRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO2dCQUN4QyxJQUFJLGNBQWMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDaEMsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQztvQkFDaEQsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQzNCLGFBQWEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElB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