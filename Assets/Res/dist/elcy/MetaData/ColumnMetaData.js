import { ExpressionBuilder } from "../ExpressionBuilder/ExpressionBuilder";
export class ColumnMetaData {
    get default() {
        return this._default;
    }
    set default(value) {
        this._default = value;
        this._defaultExp = null;
    }
    get defaultExp() {
        if (!this._defaultExp && this.default) {
            this._defaultExp = ExpressionBuilder.parse(this.default);
        }
        return this._defaultExp;
    }
    get isPrimaryColumn() {
        return this.entity.primaryKeys.contains(this);
    }
    constructor(type, entityMeta) {
        if (typeof type !== "undefined") {
            this.type = type;
        }
        if (entityMeta) {
            this.entity = entityMeta;
        }
    }
    applyOption(columnMeta) {
        if (!this.type && typeof columnMeta.type !== "undefined") {
            this.type = columnMeta.type;
        }
        if (typeof columnMeta.propertyName !== "undefined") {
            this.propertyName = columnMeta.propertyName;
        }
        if (typeof columnMeta.columnName !== "undefined") {
            this.columnName = columnMeta.columnName;
        }
        if (columnMeta.description) {
            this.description = columnMeta.description;
        }
        if (typeof columnMeta.nullable !== "undefined") {
            this.nullable = columnMeta.nullable;
        }
        if (typeof columnMeta.columnType !== "undefined") {
            this.columnType = columnMeta.columnType;
        }
        if (typeof columnMeta.collation !== "undefined") {
            this.collation = columnMeta.collation;
        }
        if (typeof columnMeta.charset !== "undefined") {
            this.charset = columnMeta.charset;
        }
        if (typeof columnMeta.isProjected !== "undefined") {
            this.isProjected = columnMeta.isProjected;
        }
        if (typeof columnMeta.isReadOnly !== "undefined") {
            this.isReadOnly = columnMeta.isReadOnly;
        }
        if (typeof columnMeta.default !== "undefined") {
            this.default = columnMeta.default;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFJM0UsTUFBTSxPQUFPLGNBQWM7SUFDdkIsSUFBVyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFXLE9BQU8sQ0FBQyxLQUFLO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFXLFVBQVU7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFXLGVBQWU7UUFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELFlBQVksSUFBcUIsRUFBRSxVQUFnQztRQUMvRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFDN0IsQ0FBQztJQUNMLENBQUM7SUFlTSxXQUFXLENBQUMsVUFBcUQ7UUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNoQyxDQUFDO1FBQ0QsSUFBSSxPQUFRLFVBQWtDLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzFFLElBQUksQ0FBQyxZQUFZLEdBQUksVUFBa0MsQ0FBQyxZQUFZLENBQUM7UUFDekUsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsVUFBVSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFFBQVEsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDeEMsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsVUFBVSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzFDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDdEMsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsV0FBVyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLE9BQVEsVUFBNEIsQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDL0QsSUFBSSxDQUFDLE9BQU8sR0FBSSxVQUE0QixDQUFDLE9BQU8sQ0FBQztRQUN6RCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=