import "reflect-metadata";
import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { Column } from "./Column";
export function DateTimeColumn(optionOrName, dbtype, defaultValue, timeZoneHanding) {
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
    return Column(DateTimeColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVRpbWVDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbi9EYXRlVGltZUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRzFCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRS9FLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLGNBQWMsQ0FBQyxZQUE2QyxFQUFFLE1BQTJCLEVBQUUsWUFBeUIsRUFBRSxlQUFrQztJQUNwSyxJQUFJLE1BQU0sR0FBMEIsRUFBRSxDQUFDO0lBQ3ZDLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQzlDLENBQUM7SUFDTCxDQUFDO1NBQ0ksSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBWSxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDIn0=