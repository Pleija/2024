import { AndExpression } from "../../ExpressionBuilder/Expression/AndExpression";
import { EqualExpression } from "../../ExpressionBuilder/Expression/EqualExpression";
import { StrictEqualExpression } from "../../ExpressionBuilder/Expression/StrictEqualExpression";
import { resolveClone, visitExpression } from "../../Helper/Util";
export class IncludeRelation {
    get childColumns() {
        if (!this._childColumns) {
            this.analyzeRelation();
        }
        return this._childColumns;
    }
    get isManyToManyRelation() {
        if (typeof this._isManyManyRelation !== "boolean") {
            this.analyzeRelation();
        }
        return this._isManyManyRelation;
    }
    get parentColumns() {
        if (!this._parentColumns) {
            this.analyzeRelation();
        }
        return this._parentColumns;
    }
    constructor(parent, child, name, type, relations) {
        if (parent) {
            this.parent = parent;
            this.child = child;
            this.relation = relations;
            this.type = type;
            this.name = name;
        }
    }
    //#endregion
    //#region Methods
    addRelation(parentColumn, childColumn) {
        const logicalExp = new StrictEqualExpression(parentColumn, childColumn);
        this.relation = this.relation ? new AndExpression(this.relation, logicalExp) : logicalExp;
    }
    clone(replaceMap) {
        const child = resolveClone(this.child, replaceMap);
        const parent = resolveClone(this.parent, replaceMap);
        const relation = resolveClone(this.relation, replaceMap);
        const clone = new IncludeRelation(parent, child, this.name, this.type, relation);
        if (child !== this.child) {
            child.parentRelation = clone;
        }
        clone.isEmbedded = this.isEmbedded;
        return clone;
    }
    *relationMap() {
        for (let i = 0, len = this.parentColumns.length; i < len; i++) {
            yield [this.parentColumns[i], this.childColumns[i]];
        }
    }
    analyzeRelation() {
        this._parentColumns = [];
        this._childColumns = [];
        this._isManyManyRelation = false;
        visitExpression(this.relation, (exp) => {
            if (exp.entity) {
                const colExp = exp;
                if (this.child.entity === colExp.entity) {
                    this._childColumns.push(colExp);
                }
                else if (this.parent.entity === colExp.entity) {
                    this._parentColumns.push(colExp);
                }
                else if (this.child.allSelects.select((o) => o.entity).contains(colExp.entity)) {
                    this._childColumns.push(colExp);
                }
                else if (this.parent.allSelects.select((o) => o.entity).contains(colExp.entity)) {
                    this._parentColumns.push(colExp);
                }
            }
            else if (!(exp instanceof AndExpression || exp instanceof EqualExpression || exp instanceof StrictEqualExpression)) {
                this._isManyManyRelation = true;
            }
        });
        if (!this._isManyManyRelation) {
            const childPks = this.child.allSelects.selectMany((o) => o.primaryKeys);
            const parentPks = this.parent.allSelects.selectMany((o) => o.primaryKeys);
            childPks.enableCache = parentPks.enableCache = true;
            this._isManyManyRelation = this._childColumns.any((o) => !childPks.contains(o)) && this._parentColumns.any((o) => !parentPks.contains(o));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5jbHVkZVJlbGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnlhYmxlL0ludGVyZmFjZS9JbmNsdWRlUmVsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUVyRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBS2xFLE1BQU0sT0FBTyxlQUFlO0lBQ3hCLElBQVcsWUFBWTtRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLG9CQUFvQjtRQUMzQixJQUFJLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDcEMsQ0FBQztJQUNELElBQVcsYUFBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQy9CLENBQUM7SUFHRCxZQUFZLE1BQTRCLEVBQUUsS0FBZ0MsRUFBRSxJQUFhLEVBQUUsSUFBdUIsRUFBRSxTQUFnQztRQUNoSixJQUFJLE1BQU0sRUFBRSxDQUFDO1lB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