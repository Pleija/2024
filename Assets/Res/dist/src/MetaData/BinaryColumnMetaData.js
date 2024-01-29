import { ColumnMetaData } from "./ColumnMetaData";
export class BinaryColumnMetaData extends ColumnMetaData {
    constructor(type, entityMeta) {
        super(type, entityMeta);
        this.columnType = "binary";
    }
    applyOption(columnMeta) {
        super.applyOption(columnMeta);
        if (typeof columnMeta.type !== "undefined") {
            this.type = columnMeta.type;
        }
        if (typeof columnMeta.size !== "undefined") {
            this.size = columnMeta.size;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5Q29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9CaW5hcnlDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHbEQsTUFBTSxPQUFPLG9CQUErQixTQUFRLGNBQW1DO0lBQ25GLFlBQVksSUFBa0MsRUFBRSxVQUFnQztRQUM1RSxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXJCLGVBQVUsR0FBcUIsUUFBUSxDQUFDO0lBRC9DLENBQUM7SUFJTSxXQUFXLENBQUMsVUFBb0M7UUFDbkQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QixJQUFJLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=