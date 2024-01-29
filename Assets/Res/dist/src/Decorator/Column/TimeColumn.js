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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vVGltZUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBSTFCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLFVBQVUsQ0FBQyxZQUF5QyxFQUFFLE1BQXVCLEVBQUUsWUFBNkIsRUFBRSxlQUFrQztJQUM1SixJQUFJLE1BQU0sR0FBc0IsRUFBRSxDQUFDO0lBQ25DLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFDRCxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQzlDLENBQUM7SUFDTCxDQUFDO1NBQ0ksSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBZ0Isa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0QsQ0FBQyJ9