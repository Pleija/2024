import "reflect-metadata";
import { IdentifierColumnMetaData } from "../../MetaData/IdentifierColumnMetaData";
import { Column } from "./Column";
export function IdentifierColumn(optionOrName, defaultValue) {
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
    return Column(IdentifierColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWRlbnRpZmllckNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0lkZW50aWZpZXJDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUVuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxZQUE2QyxFQUFFLFlBQXlCO0lBQ3JHLElBQUksTUFBTSxHQUEwQixFQUFFLENBQUM7SUFDdkMsSUFBSSxZQUFZLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO1NBQ0ksQ0FBQztRQUNGLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFzQixDQUFDO1FBQy9DLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQVksd0JBQXdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0QsQ0FBQyJ9