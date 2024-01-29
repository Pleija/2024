import { Uuid } from "../Common/Uuid";
import { ColumnMetaData } from "./ColumnMetaData";
export class IdentifierColumnMetaData extends ColumnMetaData {
    constructor(entity) {
        super(Uuid, entity);
        this.columnType = "uniqueidentifier";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRlbnRpZmllckNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L01ldGFEYXRhL0lkZW50aWZpZXJDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBR2xELE1BQU0sT0FBTyx3QkFBNkIsU0FBUSxjQUF3QjtJQUN0RSxZQUFZLE1BQTRCO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFakIsZUFBVSxHQUF5QixrQkFBa0IsQ0FBQztJQUQ3RCxDQUFDO0NBRUoifQ==