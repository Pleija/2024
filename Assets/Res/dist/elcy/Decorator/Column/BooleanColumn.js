import "reflect-metadata";
import { BooleanColumnMetaData } from "../../MetaData/BooleanColumnMetaData";
import { Column } from "./Column";
export function BooleanColumn(optionOrName, defaultValue) {
    let option;
    if (optionOrName && typeof optionOrName !== "string") {
        option = optionOrName;
    }
    else {
        option = {};
        if (typeof optionOrName !== "undefined") {
            option.columnName = optionOrName;
        }
        if (typeof defaultValue !== "undefined") {
            option.default = defaultValue;
        }
    }
    return Column(BooleanColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9vbGVhbkNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0Jvb2xlYW5Db2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2xDLE1BQU0sVUFBVSxhQUFhLENBQUMsWUFBNEMsRUFBRSxZQUE0QjtJQUNwRyxJQUFJLE1BQTRCLENBQUM7SUFDakMsSUFBSSxZQUFZLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxHQUFHLFlBQVksQ0FBQztJQUMxQixDQUFDO1NBQ0ksQ0FBQztRQUNGLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDWixJQUFJLE9BQU8sWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBc0IsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFlLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELENBQUMifQ==