import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { Column } from "./Column";
export function CreatedDateColumn(optionOrName, dbtype, timeZoneHandling) {
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
    option.isCreatedDate = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlZERhdGVDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbi9DcmVhdGVkRGF0ZUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUvRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxZQUE2QyxFQUFFLE1BQTJCLEVBQUUsZ0JBQW1DO0lBQzdJLElBQUksTUFBTSxHQUEwQixFQUFFLENBQUM7SUFDdkMsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDbkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7WUFDakMsSUFBSSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1lBQy9DLENBQUM7WUFDRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDL0IsQ0FBQztRQUNMLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMxQixDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQzVCLElBQUksTUFBTSxDQUFDLGdCQUFnQixLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3JDLDBCQUEwQjtRQUMxQixNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM1QyxDQUFDO1NBQ0ksQ0FBQztRQUNGLDBCQUEwQjtRQUMxQixNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQVksc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0QsQ0FBQyJ9