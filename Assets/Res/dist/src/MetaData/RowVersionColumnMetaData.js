import { ColumnGeneration } from "../Common/Enum";
import { ColumnMetaData } from "./ColumnMetaData";
export class RowVersionColumnMetaData extends ColumnMetaData {
    constructor() {
        super(Uint8Array);
        this.columnType = "rowversion";
        this.generation = ColumnGeneration.Insert | ColumnGeneration.Update;
        this.isReadOnly = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93VmVyc2lvbkNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvUm93VmVyc2lvbkNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxNQUFNLE9BQU8sd0JBQW1DLFNBQVEsY0FBOEI7SUFDbEY7UUFDSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFZixlQUFVLEdBQXlCLFlBQVksQ0FBQztRQUN2QyxlQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUMvRCxlQUFVLEdBQUcsSUFBSSxDQUFDO0lBSGxDLENBQUM7Q0FJSiJ9