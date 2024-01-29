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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bUNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL0VudW1Db2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHbEQsbURBQW1EO0FBQ25ELE1BQU0sT0FBTyxrQkFBOEQsU0FBUSxjQUFxQjtJQUNwRyxZQUFZLElBQXFCLEVBQUUsVUFBZ0M7UUFDL0QsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVyQixlQUFVLEdBQW1CLE1BQU0sQ0FBQztJQUQzQyxDQUFDO0lBSU0sV0FBVyxDQUFDLFVBQWtDO1FBQ2pELElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUN0QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0oifQ==