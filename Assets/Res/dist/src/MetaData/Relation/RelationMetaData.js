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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL1JlbGF0aW9uL1JlbGF0aW9uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBTW5ELE1BQU0sT0FBTyxnQkFBZ0I7SUFDekIsSUFBVyxvQkFBb0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQW1CLENBQUM7SUFDOUUsQ0FBQztJQUNELElBQVcscUJBQXFCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsWUFBWSxjQUFpRCxFQUFFLFFBQWlCO1FBdUN6RSxvQkFBZSxHQUFvQyxFQUFFLENBQUM7UUF0Q3pELElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLGNBQWMsQ0FBQyxZQUFZLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQzthQUNJLENBQUM7WUFDRixJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUM7UUFDcEQsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcs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