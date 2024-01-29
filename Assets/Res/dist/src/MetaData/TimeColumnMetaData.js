import { TimeSpan } from "../Common/TimeSpan";
import { ColumnMetaData } from "./ColumnMetaData";
export class TimeColumnMetaData extends ColumnMetaData {
    constructor() {
        super(TimeSpan);
        this.columnType = "time";
        this.timeZoneHandling = "utc";
    }
    applyOption(columnMeta) {
        super.applyOption(columnMeta);
        if (typeof columnMeta.timeZoneHandling !== "undefined") {
            this.timeZoneHandling = columnMeta.timeZoneHandling;
        }
        if (typeof columnMeta.precision !== "undefined") {
            this.precision = columnMeta.precision;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZUNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvVGltZUNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGNBQXdCO0lBQzVEO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWIsZUFBVSxHQUFtQixNQUFNLENBQUM7UUFFcEMscUJBQWdCLEdBQXFCLEtBQUssQ0FBQztJQUhsRCxDQUFDO0lBSU0sV0FBVyxDQUFDLFVBQThCO1FBQzdDLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNyRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3hELENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9