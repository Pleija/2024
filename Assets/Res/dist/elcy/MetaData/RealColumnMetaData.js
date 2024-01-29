import { ColumnMetaData } from "./ColumnMetaData";
export class RealColumnMetaData extends ColumnMetaData {
    constructor(entityMeta) {
        super(Number, entityMeta);
        this.columnType = "real";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.size !== "undefined") {
            this.size = columnMeta.size;
        }
        super.applyOption(columnMeta);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbENvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL1JlYWxDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsTUFBTSxPQUFPLGtCQUE2QixTQUFRLGNBQTBCO0lBQ3hFLFlBQVksVUFBZ0M7UUFDeEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQW1CLE1BQU0sQ0FBQztJQUQzQyxDQUFDO0lBR00sV0FBVyxDQUFDLFVBQWtDO1FBQ2pELElBQUksT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNoQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0oifQ==