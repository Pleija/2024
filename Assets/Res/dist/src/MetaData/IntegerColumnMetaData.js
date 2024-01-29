import { ColumnGeneration } from "../Common/Enum";
import { ColumnMetaData } from "./ColumnMetaData";
export class IntegerColumnMetaData extends ColumnMetaData {
    constructor(entityMeta) {
        super(Number, entityMeta);
        this.columnType = "int";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.autoIncrement !== "undefined") {
            this.autoIncrement = columnMeta.autoIncrement;
        }
        if (typeof columnMeta.size !== "undefined") {
            this.size = columnMeta.size;
        }
        super.applyOption(columnMeta);
        if (this.autoIncrement) {
            this.isReadOnly = true;
            this.generation = ColumnGeneration.Insert | ColumnGeneration.Update;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdlckNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvSW50ZWdlckNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdsRCxNQUFNLE9BQU8scUJBQWdDLFNBQVEsY0FBMEI7SUFDM0UsWUFBWSxVQUFnQztRQUN4QyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBR3ZCLGVBQVUsR0FBa0IsS0FBSyxDQUFDO0lBRnpDLENBQUM7SUFJTSxXQUFXLENBQUMsVUFBcUM7UUFDcEQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxhQUFhLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ2xELENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBQ3hFLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==