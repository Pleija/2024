import { ColumnMetaData } from "./ColumnMetaData";
export class StringColumnMetaData extends ColumnMetaData {
    constructor() {
        super(String);
        this.columnType = "nvarchar";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.length !== "undefined") {
            this.length = columnMeta.length;
        }
        super.applyOption(columnMeta);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvU3RyaW5nQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWxELE1BQU0sT0FBTyxvQkFBK0IsU0FBUSxjQUEwQjtJQUMxRTtRQUNJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVYLGVBQVUsR0FBcUIsVUFBVSxDQUFDO0lBRGpELENBQUM7SUFHTSxXQUFXLENBQUMsVUFBb0M7UUFDbkQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQ3BDLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSiJ9