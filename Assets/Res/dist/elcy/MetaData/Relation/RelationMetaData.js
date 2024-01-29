import { columnMetaKey, entityMetaKey } from "../../Decorator/DecoratorKey";
import { FunctionHelper } from "../../Helper/FunctionHelper";
import { ColumnMetaData } from "../ColumnMetaData";
export class RelationMetaData {
    get completeRelationType() {
        return this.relationType + "-" + this.reverseRelation.relationType;
    }
    get mappedRelationColumns() {
        return this.relationColumns.intersect(this.source.columns);
    }
    constructor(relationOption, isMaster) {
        this.relationColumns = [];
        this.name = relationOption.name;
        this.isMaster = isMaster;
        if (relationOption.relationType === "one?") {
            this.relationType = "one";
            this.nullable = true;
        }
        else {
            this.relationType = relationOption.relationType;
        }
        this.propertyName = relationOption.propertyName;
        this.source = Reflect.getOwnMetadata(entityMetaKey, relationOption.sourceType);
        if (relationOption.targetType) {
            this.target = Reflect.getOwnMetadata(entityMetaKey, relationOption.targetType);
        }
        this.relationColumns = relationOption.relationKeys.select((o) => typeof o === "string" ? o : FunctionHelper.propertyName(o))
            .select((o) => {
            let col = Reflect.getOwnMetadata(columnMetaKey, relationOption.sourceType, o);
            if (!col) {
                // either column will be defined later or column is not mapped.
                col = new ColumnMetaData();
                col.entity = this.source;
                col.columnName = o;
                col.nullable = this.nullable || this.deleteOption === "SET NULL";
                Reflect.defineMetadata(columnMetaKey, col, relationOption.sourceType, o);
            }
            col.isReadOnly = true;
            return col;
        }).toArray();
    }
    completeRelation(reverseRelation) {
        if (this.isMaster) {
            this.relationMaps = new Map();
            reverseRelation.relationMaps = new Map();
            this.reverseRelation = reverseRelation;
            this.reverseRelation.reverseRelation = this;
            // set each target for to make sure no problem
            this.target = this.reverseRelation.source;
            this.reverseRelation.target = this.source;
            this.reverseRelation.isMaster = false;
            // validate nullable
            if (typeof this.reverseRelation.nullable !== "boolean") {
                this.reverseRelation.nullable = this.reverseRelation.relationColumns.all((o) => o.nullable);
            }
            else if (this.reverseRelation.nullable && this.reverseRelation.relationColumns.any((o) => !o.nullable)) {
                throw new Error(`Relation ${this.name} is nullable but it's dependent column is not nullable`);
            }
            // Validate relation option.
            if (this.reverseRelation.deleteOption === "SET NULL" || this.reverseRelation.updateOption === "SET NULL") {
                if (!this.reverseRelation.nullable) {
                    throw new Error(`Relation ${this.reverseRelation.name} option is "SET NULL" but relation is not nullable`);
                }
            }
            if (this.reverseRelation.deleteOption === "SET DEFAULT" || this.reverseRelation.updateOption === "SET DEFAULT") {
                if (this.reverseRelation.relationColumns.any((o) => !o.defaultExp && !o.nullable)) {
                    throw new Error(`Relation ${this.name} option is "SET DEFAULT" but has column without default and not nullable`);
                }
            }
            if (this.completeRelationType !== "many-many") {
                // set relation maps. Many to Many relation map will be set by RelationData
                if (this.relationColumns.length <= 0) {
                    // set default value.
                    if (this.relationType === "many" && this.reverseRelation.relationType === "one") {
                        // this is a foreignkey
                        this.relationColumns = [this.fullName + "_" + this.target.type.name + "_Id"];
                    }
                    else {
                        this.relationColumns = this.relationColumns.concat(this.source.primaryKeys);
                    }
                }
                for (let i = 0, len = this.relationColumns.length; i < len; i++) {
                    const col = this.relationColumns[i];
                    const reverseCol = this.reverseRelation.relationColumns[i];
                    if (!reverseCol.type) {
                        // reverseCol is a non-mapped column
                        reverseCol.type = col.type;
                        reverseCol.columnType = col.columnType;
                        reverseCol.scale = col.scale;
                        reverseCol.length = col.length;
                        reverseCol.precision = col.precision;
                    }
                    this.relationMaps.set(col, reverseCol);
                    this.reverseRelation.relationMaps.set(reverseCol, col);
                }
            }
        }
        else {
            reverseRelation.completeRelation(this);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9SZWxhdGlvbi9SZWxhdGlvbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHNUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU1uRCxNQUFNLE9BQU8sZ0JBQWdCO0lBQ3pCLElBQVcsb0JBQW9CO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFtQixDQUFDO0lBQzlFLENBQUM7SUFDRCxJQUFXLHFCQUFxQjtRQUM1QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNELFlBQVksY0FBaUQsRUFBRSxRQUFpQjtRQXVDekUsb0JBQWUsR0FBb0MsRUFBRSxDQUFDO1FBdEN6RCxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxjQUFjLENBQUMsWUFBWSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDO1FBQ3BELENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFH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