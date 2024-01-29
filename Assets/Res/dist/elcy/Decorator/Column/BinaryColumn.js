import "reflect-metadata";
import { BinaryColumnMetaData } from "../../MetaData/BinaryColumnMetaData";
import { Column } from "./Column";
export function BinaryColumn(optionOrType, name, defaultValue) {
    let option;
    if (optionOrType && typeof optionOrType !== "function") {
        option = optionOrType;
    }
    else {
        option = {};
        if (typeof optionOrType !== "undefined") {
            option.type = optionOrType;
        }
        if (typeof name !== "undefined") {
            option.columnName = name;
        }
        if (typeof defaultValue !== "undefined") {
            option.default = defaultValue;
        }
    }
    return Column(BinaryColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5Q29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9Db2x1bW4vQmluYXJ5Q29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFM0UsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdsQyxNQUFNLFVBQVUsWUFBWSxDQUFDLFlBQWlFLEVBQUUsSUFBYSxFQUFFLFlBQW9DO0lBQy9JLElBQUksTUFBMkIsQ0FBQztJQUNoQyxJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNyRCxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7U0FDSSxDQUFDO1FBQ0YsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksR0FBRyxZQUE0QyxDQUFDO1FBQy9ELENBQUM7UUFDRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzdCLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQXVCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RFLENBQUMifQ==