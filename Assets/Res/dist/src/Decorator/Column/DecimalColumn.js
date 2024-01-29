import "reflect-metadata";
import { DecimalColumnMetaData } from "../../MetaData/DecimalColumnMetaData";
import { Column } from "./Column";
export function DecimalColumn(optionOrName, defaultValue) {
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
    return Column(DecimalColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjaW1hbENvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vRGVjaW1hbENvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHbEMsTUFBTSxVQUFVLGFBQWEsQ0FBQyxZQUE0QyxFQUFFLFlBQTJCO0lBQ25HLElBQUksTUFBTSxHQUF5QixFQUFFLENBQUM7SUFDdEMsSUFBSSxZQUFZLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO1NBQ0ksQ0FBQztRQUNGLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFzQixDQUFDO1FBQy9DLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQWMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUQsQ0FBQyJ9