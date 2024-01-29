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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZUNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL1RpbWVDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWxELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxjQUF3QjtJQUM1RDtRQUNJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUViLGVBQVUsR0FBbUIsTUFBTSxDQUFDO1FBRXBDLHFCQUFnQixHQUFxQixLQUFLLENBQUM7SUFIbEQsQ0FBQztJQUlNLFdBQVcsQ0FBQyxVQUE4QjtRQUM3QyxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlCLElBQUksT0FBTyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDckQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzFDLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==