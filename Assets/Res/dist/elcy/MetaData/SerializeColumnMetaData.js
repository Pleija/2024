import { ColumnMetaData } from "./ColumnMetaData";
export class SerializeColumnMetaData extends ColumnMetaData {
    constructor(type, entityMeta) {
        super(type, entityMeta);
        this.columnType = "json";
    }
    applyOption(columnMeta) {
        super.applyOption(columnMeta);
        if (typeof columnMeta.type !== "undefined") {
            this.type = columnMeta.type;
        }
    }
    deserialize(data) {
        return JSON.stringify(data);
    }
    serialize(data) {
        return JSON.parse(data);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VyaWFsaXplQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvU2VyaWFsaXplQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBR2xELE1BQU0sT0FBTyx1QkFBK0IsU0FBUSxjQUFxQjtJQUNyRSxZQUFZLElBQW9CLEVBQUUsVUFBZ0M7UUFDOUQsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVyQixlQUFVLEdBQXdCLE1BQU0sQ0FBQztJQURoRCxDQUFDO0lBR00sV0FBVyxDQUFDLFVBQTBDO1FBQ3pELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ00sV0FBVyxDQUFDLElBQU87UUFDdEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDTSxTQUFTLENBQUMsSUFBWTtRQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKIn0=