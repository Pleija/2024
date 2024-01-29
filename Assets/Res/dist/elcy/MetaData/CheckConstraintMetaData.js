import { MemberAccessExpression } from "../ExpressionBuilder/Expression/MemberAccessExpression";
import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
import { replaceExpression } from "../Helper/Util";
import { ColumnExpression } from "../Queryable/QueryExpression/ColumnExpression";
import { ComputedColumnExpression } from "../Queryable/QueryExpression/ComputedColumnExpression";
import { EntityExpression } from "../Queryable/QueryExpression/EntityExpression";
import { ComputedColumnMetaData } from "./ComputedColumnMetaData";
export class CheckConstraintMetaData {
    get definition() {
        if (!this._definition) {
            const fnExp = ExpressionBuilder.parse(this.checkFn, [this.entity.type]);
            this._definition = this.toDefinitionExpression(fnExp);
            this.checkFn = null;
        }
        return this._definition;
    }
    constructor(name, entity, definition) {
        this.name = name;
        this.entity = entity;
        if (definition instanceof Function) {
            this.checkFn = definition;
        }
        else {
            this._definition = definition;
        }
    }
    getDefinitionString(queryBuilder) {
        if (typeof this.definition === "string") {
            return this.definition;
        }
        return queryBuilder.toLogicalString(this.definition);
    }
    toDefinitionExpression(fnExp) {
        const entityParamExp = fnExp.params[0];
        const entityExp = new EntityExpression(this.entity.type, entityParamExp.name);
        replaceExpression(fnExp.body, (exp) => {
            if (exp instanceof MemberAccessExpression && exp.objectOperand === entityParamExp) {
                const columnMeta = this.entity.columns.first((o) => o.propertyName === exp.memberName);
                if (columnMeta instanceof ComputedColumnMetaData) {
                    const fnExpClone = columnMeta.functionExpression.clone();
                    replaceExpression(fnExpClone, (exp2) => exp2 === fnExpClone.params[0] ? entityParamExp : exp2);
                    return new ComputedColumnExpression(entityExp, fnExpClone.body, columnMeta.propertyName);
                }
                return new ColumnExpression(entityExp, columnMeta);
            }
            return exp;
        });
        return fnExp.body;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tDb25zdHJhaW50TWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvQ2hlY2tDb25zdHJhaW50TWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDakYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDakcsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDakYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFLbEUsTUFBTSxPQUFPLHVCQUF1QjtJQUNoQyxJQUFXLFVBQVU7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQixNQUFNLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFDRCxZQUFtQixJQUFZLEVBQWtCLE1BQWdDLEVBQUUsVUFBNEQ7UUFBNUgsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFrQixXQUFNLEdBQU4sTUFBTSxDQUEwQjtRQUM3RSxJQUFJLFVBQVUsWUFBWSxRQUFRLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztRQUM5QixDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBSU0sbUJBQW1CLENBQUMsWUFBMkI7UUFDbEQsSUFBSSxPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDUyxzQkFBc0IsQ0FBQyxLQUFrQztRQUMvRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsQyxJQUFJLEdBQUcsWUFBWSxzQkFBc0IsSUFBSSxHQUFHLENBQUMsYUFBYSxLQUFLLGNBQWMsRUFBRSxDQUFDO2dCQUNoRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2RixJQUFJLFVBQVUsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO29CQUMvQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3pELGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9GLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzdGLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBQ0QsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztJQUN0QixDQUFDO0NBQ0oifQ==