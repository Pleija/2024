import "reflect-metadata";
import { TimeColumnMetaData } from "../../MetaData/TimeColumnMetaData";
import { Column } from "./Column";
export function TimeColumn(optionOrName, dbtype, defaultValue, timeZoneHanding) {
    let option = {};
    if (typeof optionOrName === "string") {
        option.columnName = optionOrName;
        if (defaultValue !== undefined) {
            option.default = defaultValue;
        }
        if (dbtype !== undefined) {
            option.columnType = dbtype;
        }
        if (timeZoneHanding !== undefined) {
            option.timeZoneHandling = timeZoneHanding;
        }
    }
    else if (optionOrName) {
        option = optionOrName;
    }
    return Column(TimeColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL1RpbWVDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUkxQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUV2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxVQUFVLENBQUMsWUFBeUMsRUFBRSxNQUF1QixFQUFFLFlBQTZCLEVBQUUsZUFBa0M7SUFDNUosSUFBSSxNQUFNLEdBQXNCLEVBQUUsQ0FBQztJQUNuQyxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUM5QyxDQUFDO0lBQ0wsQ0FBQztTQUNJLElBQUksWUFBWSxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO0lBRUQsT0FBTyxNQUFNLENBQWdCLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELENBQUMifQ==