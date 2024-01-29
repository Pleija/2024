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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBlZEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0dyb3VwZWRFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU12RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUd0RCxNQUFNLE9BQU8saUJBQTJCLFNBQVEsZ0JBQW1CO0lBQy9ELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQ0QsSUFBVyxPQUFPO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNuQixJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQXdCLENBQUM7Z0JBQ2hELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3hDLElBQUksY0FBYyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNoQyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDO29CQUNoRCxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDdkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDM0IsYUFBYSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFB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