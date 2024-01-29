import { ColumnMetaData } from "./ColumnMetaData";
export class BinaryColumnMetaData extends ColumnMetaData {
    constructor(type, entityMeta) {
        super(type, entityMeta);
        this.columnType = "binary";
    }
    applyOption(columnMeta) {
        super.applyOption(columnMeta);
        if (typeof columnMeta.type !== "undefined") {
            this.type = columnMeta.type;
        }
        if (typeof columnMeta.size !== "undefined") {
            this.size = columnMeta.size;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5Q29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvQmluYXJ5Q29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBR2xELE1BQU0sT0FBTyxvQkFBK0IsU0FBUSxjQUFtQztJQUNuRixZQUFZLElBQWtDLEVBQUUsVUFBZ0M7UUFDNUUsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVyQixlQUFVLEdBQXFCLFFBQVEsQ0FBQztJQUQvQyxDQUFDO0lBSU0sV0FBVyxDQUFDLFVBQW9DO1FBQ25ELEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9