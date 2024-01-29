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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVRpbWVDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvQ29sdW1uL0RhdGVUaW1lQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFHMUIsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUlsQyxNQUFNLFVBQVUsY0FBYyxDQUFDLFlBQTZDLEVBQUUsTUFBMkIsRUFBRSxZQUF5QixFQUFFLGVBQWtDO0lBQ3BLLElBQUksTUFBTSxHQUEwQixFQUFFLENBQUM7SUFDdkMsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO1FBQ0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUNELElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDOUMsQ0FBQztJQUNMLENBQUM7U0FDSSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFZLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELENBQUMifQ==