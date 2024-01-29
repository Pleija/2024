import "reflect-metadata";
import { RowVersionColumnMetaData } from "../../MetaData/RowVersionColumnMetaData";
import { Column } from "./Column";
export function RowVersionColumn(optionOrName, defaultValue) {
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
    return Column(RowVersionColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93VmVyc2lvbkNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL1Jvd1ZlcnNpb25Db2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUVuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2xDLE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxZQUErQyxFQUFFLFlBQTJCO0lBQ3pHLElBQUksTUFBTSxHQUE0QixFQUFFLENBQUM7SUFDekMsSUFBSSxZQUFZLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO1NBQ0ksQ0FBQztRQUNGLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFzQixDQUFDO1FBQy9DLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQWtCLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3JFLENBQUMifQ==