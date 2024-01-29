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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdlckNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0ludGVnZXJDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxhQUFhLENBQUMsWUFBNEMsRUFBRSxZQUEyQjtJQUNuRyxJQUFJLE1BQU0sR0FBeUIsRUFBRSxDQUFDO0lBQ3RDLElBQUksWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25ELE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztTQUNJLENBQUM7UUFDRixJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBc0IsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFjLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlELENBQUMifQ==