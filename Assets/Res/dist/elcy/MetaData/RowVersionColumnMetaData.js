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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93VmVyc2lvbkNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL1Jvd1ZlcnNpb25Db2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsTUFBTSxPQUFPLHdCQUFtQyxTQUFRLGNBQThCO0lBQ2xGO1FBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWYsZUFBVSxHQUF5QixZQUFZLENBQUM7UUFDdkMsZUFBVSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7UUFDL0QsZUFBVSxHQUFHLElBQUksQ0FBQztJQUhsQyxDQUFDO0NBSUoifQ==