import { ColumnMetaData } from "./ColumnMetaData";
// tslint:disable-next-line:ban-types
export class BooleanColumnMetaData extends ColumnMetaData {
    constructor(entityMeta) {
        super(Boolean, entityMeta);
        this.columnType = "boolean";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.isDeleteColumn !== "undefined") {
            this.isDeleteColumn = columnMeta.isDeleteColumn;
        }
        super.applyOption(columnMeta);
        if (this.isDeleteColumn) {
            this.isReadOnly = true;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9vbGVhbkNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL0Jvb2xlYW5Db2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQscUNBQXFDO0FBQ3JDLE1BQU0sT0FBTyxxQkFBZ0MsU0FBUSxjQUEyQjtJQUM1RSxZQUFZLFVBQWdDO1FBQ3hDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFeEIsZUFBVSxHQUFzQixTQUFTLENBQUM7SUFEakQsQ0FBQztJQUlNLFdBQVcsQ0FBQyxVQUFxQztRQUNwRCxJQUFJLE9BQU8sVUFBVSxDQUFDLGNBQWMsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNuRCxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDcEQsQ0FBQztRQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9