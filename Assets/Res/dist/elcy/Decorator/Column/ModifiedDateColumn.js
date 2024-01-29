import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { Column } from "./Column";
export function ModifiedDateColumn(optionOrName, dbtype, timeZoneHandling) {
    let option = {};
    if (optionOrName) {
        if (typeof optionOrName === "string") {
            option.columnName = optionOrName;
            if (timeZoneHandling !== undefined) {
                option.timeZoneHandling = timeZoneHandling;
            }
            if (dbtype !== undefined) {
                option.columnType = dbtype;
            }
        }
        else {
            option = optionOrName;
        }
    }
    option.isModifiedDate = true;
    if (option.timeZoneHandling === "none") {
        /* istanbul ignore next */
        option.default = () => Date.timestamp();
    }
    else {
        /* istanbul ignore next */
        option.default = () => Date.utcTimestamp();
    }
    return Column(DateTimeColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kaWZpZWREYXRlQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9Db2x1bW4vTW9kaWZpZWREYXRlQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRS9FLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLFlBQTZDLEVBQUUsTUFBMkIsRUFBRSxnQkFBbUM7SUFDOUksSUFBSSxNQUFNLEdBQTBCLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztZQUNqQyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNqQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDL0MsQ0FBQztZQUNELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQzthQUNJLENBQUM7WUFDRixNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQzFCLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDckMsMEJBQTBCO1FBQzFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVDLENBQUM7U0FDSSxDQUFDO1FBQ0YsMEJBQTBCO1FBQzFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBWSxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDIn0=