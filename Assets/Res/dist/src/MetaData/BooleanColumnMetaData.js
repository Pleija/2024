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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9vbGVhbkNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvQm9vbGVhbkNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxxQ0FBcUM7QUFDckMsTUFBTSxPQUFPLHFCQUFnQyxTQUFRLGNBQTJCO0lBQzVFLFlBQVksVUFBZ0M7UUFDeEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUV4QixlQUFVLEdBQXNCLFNBQVMsQ0FBQztJQURqRCxDQUFDO0lBSU0sV0FBVyxDQUFDLFVBQXFDO1FBQ3BELElBQUksT0FBTyxVQUFVLENBQUMsY0FBYyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=