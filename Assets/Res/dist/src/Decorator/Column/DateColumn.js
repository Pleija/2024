import "reflect-metadata";
import { DateColumnMetaData } from "../../MetaData/DateColumnMetaData";
import { Column } from "./Column";
export function DateColumn(optionOrName, dbtype, defaultValue) {
    let option = {};
    if (typeof optionOrName === "string") {
        option.columnName = optionOrName;
        if (defaultValue !== undefined) {
            option.default = defaultValue;
        }
        if (dbtype !== undefined) {
            option.columnType = dbtype;
        }
    }
    else if (optionOrName) {
        option = optionOrName;
    }
    return Column(DateColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9Db2x1bW4vRGF0ZUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEMsTUFBTSxVQUFVLFVBQVUsQ0FBQyxZQUF5QyxFQUFFLE1BQXVCLEVBQUUsWUFBeUI7SUFDcEgsSUFBSSxNQUFNLEdBQXNCLEVBQUUsQ0FBQztJQUNuQyxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztTQUNJLElBQUksWUFBWSxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO0lBRUQsT0FBTyxNQUFNLENBQVksa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekQsQ0FBQyJ9