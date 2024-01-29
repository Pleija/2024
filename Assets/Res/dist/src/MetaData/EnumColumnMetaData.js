import { ColumnMetaData } from "./ColumnMetaData";
// TODO: for not supported db, use Check constraint
export class EnumColumnMetaData extends ColumnMetaData {
    constructor(type, entityMeta) {
        super(type, entityMeta);
        this.columnType = "enum";
    }
    applyOption(columnMeta) {
        if (typeof columnMeta.options !== "undefined") {
            this.options = columnMeta.options;
        }
        super.applyOption(columnMeta);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bUNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvRW51bUNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdsRCxtREFBbUQ7QUFDbkQsTUFBTSxPQUFPLGtCQUE4RCxTQUFRLGNBQXFCO0lBQ3BHLFlBQVksSUFBcUIsRUFBRSxVQUFnQztRQUMvRCxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXJCLGVBQVUsR0FBbUIsTUFBTSxDQUFDO0lBRDNDLENBQUM7SUFJTSxXQUFXLENBQUMsVUFBa0M7UUFDakQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSiJ9