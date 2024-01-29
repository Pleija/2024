import "reflect-metadata";
import { BooleanColumnMetaData } from "../../MetaData/BooleanColumnMetaData";
import { Column } from "./Column";
export function DeletedColumn(optionOrName) {
    let option = {};
    if (typeof optionOrName === "string") {
        option.columnName = optionOrName;
    }
    else if (optionOrName) {
        option = optionOrName;
    }
    option.isDeleteColumn = true;
    /* istanbul ignore next */
    option.default = () => false;
    return Column(BooleanColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlZENvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vRGVsZXRlZENvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLGFBQWEsQ0FBQyxZQUE0QztJQUN0RSxJQUFJLE1BQU0sR0FBeUIsRUFBRSxDQUFDO0lBQ3RDLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7SUFDckMsQ0FBQztTQUNJLElBQUksWUFBWSxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsMEJBQTBCO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0lBQzdCLE9BQU8sTUFBTSxDQUFlLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELENBQUMifQ==