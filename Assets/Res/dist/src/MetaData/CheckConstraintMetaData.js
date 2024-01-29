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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tDb25zdHJhaW50TWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9DaGVja0NvbnN0cmFpbnRNZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUNoRyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNqRyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUtsRSxNQUFNLE9BQU8sdUJBQXVCO0lBQ2hDLElBQVcsVUFBVTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNELFlBQW1CLElBQVksRUFBa0IsTUFBZ0MsRUFBRSxVQUE0RDtRQUE1SCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQWtCLFdBQU0sR0FBTixNQUFNLENBQTBCO1FBQzdFLElBQUksVUFBVSxZQUFZLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO1FBQzlCLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFJTSxtQkFBbUIsQ0FBQyxZQUEyQjtRQUNsRCxJQUFJLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8sWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNTLHNCQUFzQixDQUFDLEtBQWtDO1FBQy9ELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2xDLElBQUksR0FBRyxZQUFZLHNCQUFzQixJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssY0FBYyxFQUFFLENBQUM7Z0JBQ2hGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZGLElBQUksVUFBVSxZQUFZLHNCQUFzQixFQUFFLENBQUM7b0JBQy9DLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDekQsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDL0YsT0FBTyxJQUFJLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDN0YsQ0FBQztnQkFDRCxPQUFPLElBQUksZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUM7Q0FDSiJ9