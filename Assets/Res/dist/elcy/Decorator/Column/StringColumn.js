import "reflect-metadata";
import { StringColumnMetaData } from "../../MetaData/StringColumnMetaData";
import { Column } from "./Column";
export function StringColumn(optionOrName, defaultValue) {
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
    return Column(StringColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9Db2x1bW4vU3RyaW5nQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFM0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdsQyxNQUFNLFVBQVUsWUFBWSxDQUFDLFlBQTJDLEVBQUUsWUFBMkI7SUFDakcsSUFBSSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztJQUNyQyxJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNuRCxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7U0FDSSxDQUFDO1FBQ0YsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQXNCLENBQUM7UUFDL0MsQ0FBQztRQUNELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBYyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3RCxDQUFDIn0=