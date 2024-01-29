import { Uuid } from "../Common/Uuid";
import { ColumnMetaData } from "./ColumnMetaData";
export class IdentifierColumnMetaData extends ColumnMetaData {
    constructor(entity) {
        super(Uuid, entity);
        this.columnType = "uniqueidentifier";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRlbnRpZmllckNvbHVtbk1ldGFEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvTWV0YURhdGEvSWRlbnRpZmllckNvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHbEQsTUFBTSxPQUFPLHdCQUE2QixTQUFRLGNBQXdCO0lBQ3RFLFlBQVksTUFBNEI7UUFDcEMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVqQixlQUFVLEdBQXlCLGtCQUFrQixDQUFDO0lBRDdELENBQUM7Q0FFSiJ9