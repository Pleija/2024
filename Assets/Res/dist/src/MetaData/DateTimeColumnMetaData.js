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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVRpbWVDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL0RhdGVUaW1lQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBR2xELE1BQU0sT0FBTyxzQkFBaUMsU0FBUSxjQUF3QjtJQUMxRSxZQUFZLFVBQWdDO1FBQ3hDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFckIsZUFBVSxHQUF1QixVQUFVLENBQUM7UUFJNUMscUJBQWdCLEdBQXFCLEtBQUssQ0FBQztJQUxsRCxDQUFDO0lBTU0sV0FBVyxDQUFDLFVBQXNDO1FBQ3JELElBQUksT0FBTyxVQUFVLENBQUMsYUFBYSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUNsRCxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxjQUFjLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDbkQsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDO1FBQ3BELENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlCLElBQUksT0FBTyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDckQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzFDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1lBQzFDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsVUFBVSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUMvQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9