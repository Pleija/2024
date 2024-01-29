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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbENvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvUmVhbENvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxNQUFNLE9BQU8sa0JBQTZCLFNBQVEsY0FBMEI7SUFDeEUsWUFBWSxVQUFnQztRQUN4QyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXZCLGVBQVUsR0FBbUIsTUFBTSxDQUFDO0lBRDNDLENBQUM7SUFHTSxXQUFXLENBQUMsVUFBa0M7UUFDakQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSiJ9