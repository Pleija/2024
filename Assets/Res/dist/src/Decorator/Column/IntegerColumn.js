import "reflect-metadata";
import { IntegerColumnMetaData } from "../../MetaData/IntegerColumnMetaData";
import { Column } from "./Column";
export function IntegerColumn(optionOrName, defaultValue) {
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
    return Column(IntegerColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdlckNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vSW50ZWdlckNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLGFBQWEsQ0FBQyxZQUE0QyxFQUFFLFlBQTJCO0lBQ25HLElBQUksTUFBTSxHQUF5QixFQUFFLENBQUM7SUFDdEMsSUFBSSxZQUFZLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO1NBQ0ksQ0FBQztRQUNGLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFzQixDQUFDO1FBQy9DLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQWMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUQsQ0FBQyJ9