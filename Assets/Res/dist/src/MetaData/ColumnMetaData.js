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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9Db2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUkzRSxNQUFNLE9BQU8sY0FBYztJQUN2QixJQUFXLE9BQU87UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUNELElBQVcsT0FBTyxDQUFDLEtBQUs7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQVcsVUFBVTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQVcsZUFBZTtRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsWUFBWSxJQUFxQixFQUFFLFVBQWdDO1FBQy9ELElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksVUFBVSxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztRQUM3QixDQUFDO0lBQ0wsQ0FBQztJQWVNLFdBQVcsQ0FBQyxVQUFxRDtRQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJLE9BQVEsVUFBa0MsQ0FBQyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDMUUsSUFBSSxDQUFDLFlBQVksR0FBSSxVQUFrQyxDQUFDLFlBQVksQ0FBQztRQUN6RSxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDOUMsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQzVDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDMUMsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUN0QyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFVBQVUsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDNUMsQ0FBQztRQUNELElBQUksT0FBUSxVQUE0QixDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUMvRCxJQUFJLENBQUMsT0FBTyxHQUFJLFVBQTRCLENBQUMsT0FBTyxDQUFDO1FBQ3pELENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==