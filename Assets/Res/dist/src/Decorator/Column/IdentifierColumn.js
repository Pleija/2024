import "reflect-metadata";
import { IdentifierColumnMetaData } from "../../MetaData/IdentifierColumnMetaData";
import { Column } from "./Column";
export function IdentifierColumn(optionOrName, defaultValue) {
    let option = {};
    if (optionOrName && typeof optionOrName !== "string") {
        option = optionOrName;
    }
    else {
        if (typeof optionOrName !== "undefined") {
            option.columnName = optionOrName;
        }
        if (typeof defaultValue !== "undefined") {
            option.default = defaultValue;
        }
    }
    return Column(IdentifierColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRlbnRpZmllckNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vSWRlbnRpZmllckNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRW5GLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFlBQTZDLEVBQUUsWUFBeUI7SUFDckcsSUFBSSxNQUFNLEdBQTBCLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNuRCxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7U0FDSSxDQUFDO1FBQ0YsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQXNCLENBQUM7UUFDL0MsQ0FBQztRQUNELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBWSx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvRCxDQUFDIn0=