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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjaW1hbENvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL0RlY2ltYWxDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsTUFBTSxPQUFPLHFCQUFnQyxTQUFRLGNBQTBCO0lBQzNFLFlBQVksVUFBZ0M7UUFDeEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQXNCLFNBQVMsQ0FBQztJQURqRCxDQUFDO0lBS00sV0FBVyxDQUFDLFVBQXFDO1FBQ3BELElBQUksT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzFDLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSiJ9