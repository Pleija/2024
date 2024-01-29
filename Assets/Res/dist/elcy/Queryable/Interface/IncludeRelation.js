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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5jbHVkZVJlbGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5YWJsZS9JbnRlcmZhY2UvSW5jbHVkZVJlbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNqRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFckYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDakcsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUtsRSxNQUFNLE9BQU8sZUFBZTtJQUN4QixJQUFXLFlBQVk7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxvQkFBb0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ3BDLENBQUM7SUFDRCxJQUFXLGFBQWE7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQixDQUFDO0lBR0QsWUFBWSxNQUE0QixFQUFFLEtBQWdDLEVBQUUsSUFBYSxFQUFFLElBQXVCLEVBQUUsU0FBZ0M7UUFDaEosSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBZUQsWUFBWTtJQUVaLGlCQUFpQjtJQUNWLFdBQVcsQ0FBQyxZQUErQixFQUFFLFdBQThCO1FBQzlFLE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQXFCLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQzlGLENBQUM7SUFDTSxLQUFLLENBQUMsVUFBeUM7UUFDbEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbkQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakYsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLENBQUUsV0FBVztRQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0wsQ0FBQztJQUVPLGVBQWU7UUFDbkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUNqQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQWdCLEVBQUUsRUFBRTtZQUNoRCxJQUFLLEdBQXlCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLEdBQXdCLENBQUM7Z0JBQ3hDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztxQkFDSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7cUJBQ0ksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQzdFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO3FCQUNJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUM5RSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckMsQ0FBQztZQUNMLENBQUM7aUJBQ0ksSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLGFBQWEsSUFBSSxHQUFHLFlBQVksZUFBZSxJQUFJLEdBQUcsWUFBWSxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pILElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDcEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUksQ0FBQztJQUNMLENBQUM7Q0FFSiJ9