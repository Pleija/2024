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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlZENvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0RlbGV0ZWRDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxhQUFhLENBQUMsWUFBNEM7SUFDdEUsSUFBSSxNQUFNLEdBQXlCLEVBQUUsQ0FBQztJQUN0QyxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO0lBQ3JDLENBQUM7U0FDSSxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzdCLDBCQUEwQjtJQUMxQixNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUM3QixPQUFPLE1BQU0sQ0FBZSxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvRCxDQUFDIn0=