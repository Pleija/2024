import "reflect-metadata";
import { BinaryColumnMetaData } from "../../MetaData/BinaryColumnMetaData";
import { Column } from "./Column";
export function BinaryColumn(optionOrType, name, defaultValue) {
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
    return Column(BinaryColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmluYXJ5Q29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0NvbHVtbi9CaW5hcnlDb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUUzRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2xDLE1BQU0sVUFBVSxZQUFZLENBQUMsWUFBaUUsRUFBRSxJQUFhLEVBQUUsWUFBb0M7SUFDL0ksSUFBSSxNQUEyQixDQUFDO0lBQ2hDLElBQUksWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ3JELE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztTQUNJLENBQUM7UUFDRixNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxHQUFHLFlBQTRDLENBQUM7UUFDL0QsQ0FBQztRQUNELElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUIsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBdUIsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEUsQ0FBQyJ9