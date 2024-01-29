import { ColumnGeneration } from "../Common/Enum";
import { ColumnMetaData } from "./ColumnMetaData";
export class DateTimeColumnMetaData extends ColumnMetaData {
    constructor(entityMeta) {
        super(Date, entityMeta);
        this.columnType = "datetime";
        this.timeZoneHandling = "utc";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.isCreatedDate !== "undefined") {
            this.isCreatedDate = columnMeta.isCreatedDate;
        }
        if (typeof columnMeta.isModifiedDate !== "undefined") {
            this.isModifiedDate = columnMeta.isModifiedDate;
        }
        super.applyOption(columnMeta);
        if (typeof columnMeta.timeZoneHandling !== "undefined") {
            this.timeZoneHandling = columnMeta.timeZoneHandling;
        }
        if (typeof columnMeta.precision !== "undefined") {
            this.precision = columnMeta.precision;
        }
        if (this.isCreatedDate || this.isModifiedDate) {
            this.isReadOnly = true;
            this.generation = ColumnGeneration.Insert;
            if (this.isModifiedDate) {
                this.generation |= ColumnGeneration.Update;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVRpbWVDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9EYXRlVGltZUNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdsRCxNQUFNLE9BQU8sc0JBQWlDLFNBQVEsY0FBd0I7SUFDMUUsWUFBWSxVQUFnQztRQUN4QyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXJCLGVBQVUsR0FBdUIsVUFBVSxDQUFDO1FBSTVDLHFCQUFnQixHQUFxQixLQUFLLENBQUM7SUFMbEQsQ0FBQztJQU1NLFdBQVcsQ0FBQyxVQUFzQztRQUNyRCxJQUFJLE9BQU8sVUFBVSxDQUFDLGFBQWEsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDbEQsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsY0FBYyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5QixJQUFJLE9BQU8sVUFBVSxDQUFDLGdCQUFnQixLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3JELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDeEQsQ0FBQztRQUNELElBQUksT0FBTyxVQUFVLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDL0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==