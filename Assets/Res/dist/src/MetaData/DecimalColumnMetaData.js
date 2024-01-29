import { ColumnMetaData } from "./ColumnMetaData";
export class DecimalColumnMetaData extends ColumnMetaData {
    constructor(entityMeta) {
        super(Number, entityMeta);
        this.columnType = "decimal";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.scale !== "undefined") {
            this.scale = columnMeta.scale;
        }
        if (typeof columnMeta.precision !== "undefined") {
            this.precision = columnMeta.precision;
        }
        super.applyOption(columnMeta);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjaW1hbENvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvRGVjaW1hbENvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxNQUFNLE9BQU8scUJBQWdDLFNBQVEsY0FBMEI7SUFDM0UsWUFBWSxVQUFnQztRQUN4QyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXZCLGVBQVUsR0FBc0IsU0FBUyxDQUFDO0lBRGpELENBQUM7SUFLTSxXQUFXLENBQUMsVUFBcUM7UUFDcEQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDMUMsQ0FBQztRQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNKIn0=