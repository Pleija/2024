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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9TdHJpbmdDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsTUFBTSxPQUFPLG9CQUErQixTQUFRLGNBQTBCO0lBQzFFO1FBQ0ksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRVgsZUFBVSxHQUFxQixVQUFVLENBQUM7SUFEakQsQ0FBQztJQUdNLFdBQVcsQ0FBQyxVQUFvQztRQUNuRCxJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDcEMsQ0FBQztRQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNKIn0=