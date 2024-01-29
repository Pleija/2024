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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kaWZpZWREYXRlQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0NvbHVtbi9Nb2RpZmllZERhdGVDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUlsQyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsWUFBNkMsRUFBRSxNQUEyQixFQUFFLGdCQUFtQztJQUM5SSxJQUFJLE1BQU0sR0FBMEIsRUFBRSxDQUFDO0lBQ3ZDLElBQUksWUFBWSxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1lBQ2pDLElBQUksZ0JBQWdCLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztZQUMvQyxDQUFDO1lBQ0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDMUIsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztJQUM3QixJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxNQUFNLEVBQUUsQ0FBQztRQUNyQywwQkFBMEI7UUFDMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDNUMsQ0FBQztTQUNJLENBQUM7UUFDRiwwQkFBMEI7UUFDMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFZLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdELENBQUMifQ==