import "reflect-metadata";
import { RealColumnMetaData } from "../../MetaData/RealColumnMetaData";
import { Column } from "./Column";
export function RealColumn(optionOrName, defaultValue) {
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
    return Column(RealColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbENvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL1JlYWxDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUV2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxVQUFVLENBQUMsWUFBeUMsRUFBRSxZQUEyQjtJQUM3RixJQUFJLE1BQU0sR0FBc0IsRUFBRSxDQUFDO0lBQ25DLElBQUksWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ25ELE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztTQUNJLENBQUM7UUFDRixJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBc0IsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFjLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNELENBQUMifQ==