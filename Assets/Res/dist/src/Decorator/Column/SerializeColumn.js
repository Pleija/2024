import "reflect-metadata";
import { SerializeColumnMetaData } from "../../MetaData/SerializeColumnMetaData";
import { Column } from "./Column";
export function SerializeColumn(optionOrType, name, defaultValue) {
    let option;
    if (optionOrType && typeof optionOrType !== "function") {
        option = optionOrType;
    }
    else {
        option = {};
        if (typeof optionOrType !== "undefined") {
            option.type = optionOrType;
        }
        if (typeof name !== "undefined") {
            option.columnName = name;
        }
        if (typeof defaultValue !== "undefined") {
            option.default = defaultValue;
        }
    }
    return Column(SerializeColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VyaWFsaXplQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0NvbHVtbi9TZXJpYWxpemVDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUVqRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2xDLE1BQU0sVUFBVSxlQUFlLENBQUksWUFBeUQsRUFBRSxJQUFhLEVBQUUsWUFBc0I7SUFDL0gsSUFBSSxNQUFpQyxDQUFDO0lBQ3RDLElBQUksWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ3JELE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztTQUNJLENBQUM7UUFDRixNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxHQUFHLFlBQThCLENBQUM7UUFDakQsQ0FBQztRQUNELElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUIsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBUyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzRCxDQUFDIn0=