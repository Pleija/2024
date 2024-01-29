import "reflect-metadata";
import { SerializeColumnMetaData } from "../../MetaData/SerializeColumnMetaData";
import { Column } from "./Column";
export function SerializeColumn(optionOrType, name, defaultValue) {
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
    return Column(SerializeColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VyaWFsaXplQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9Db2x1bW4vU2VyaWFsaXplQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFFakYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdsQyxNQUFNLFVBQVUsZUFBZSxDQUFJLFlBQXlELEVBQUUsSUFBYSxFQUFFLFlBQXNCO0lBQy9ILElBQUksTUFBaUMsQ0FBQztJQUN0QyxJQUFJLFlBQVksSUFBSSxPQUFPLFlBQVksS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNyRCxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7U0FDSSxDQUFDO1FBQ0YsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksR0FBRyxZQUE4QixDQUFDO1FBQ2pELENBQUM7UUFDRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzdCLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQVMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDM0QsQ0FBQyJ9