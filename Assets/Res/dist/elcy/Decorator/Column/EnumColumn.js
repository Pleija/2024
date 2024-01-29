import "reflect-metadata";
import { EnumColumnMetaData } from "../../MetaData/EnumColumnMetaData";
import { Column } from "./Column";
export function EnumColumn(options, defaultValue) {
    let option = { type: String };
    if (!Array.isArray(options) && options.options) {
        option = options;
    }
    else {
        option.options = options;
        if (defaultValue) {
            option.default = defaultValue;
        }
    }
    let valueOptions = [];
    if (option.options) {
        if (Array.isArray(option.options)) {
            valueOptions = option.options;
            if (option.options.length > 0) {
                if (typeof option.options[0] === "number") {
                    option.type = Number;
                }
            }
            else {
                throw new Error("enum empty");
            }
        }
        else {
            const optionKeys = Object.keys(option.options);
            if (optionKeys.length > 0) {
                valueOptions = optionKeys.map((item) => option.options[item]);
                if (typeof option.options[optionKeys[0]] === "number") {
                    option.type = Number;
                }
            }
            else {
                throw new Error("enum empty");
            }
        }
    }
    option.options = valueOptions;
    return Column(EnumColumnMetaData, option);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL0VudW1Db2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUV2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDLE1BQU0sVUFBVSxVQUFVLENBQTRCLE9BQW9ELEVBQUUsWUFBc0I7SUFDOUgsSUFBSSxNQUFNLEdBQXlCLEVBQUUsSUFBSSxFQUFFLE1BQWEsRUFBRSxDQUFDO0lBQzNELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFLLE9BQWdDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkUsTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUNyQixDQUFDO1NBQ0ksQ0FBQztRQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBK0IsQ0FBQztRQUNqRCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2YsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLFlBQVksR0FBUSxFQUFFLENBQUM7SUFDM0IsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2hDLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQzlCLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLElBQUksT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUN4QyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQWEsQ0FBQztnQkFDaEMsQ0FBQztZQUNMLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO2FBQ0ksQ0FBQztZQUNGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFFLE1BQU0sQ0FBQyxPQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNwRCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQWEsQ0FBQztnQkFDaEMsQ0FBQztZQUNMLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0lBQzlCLE9BQU8sTUFBTSxDQUF1QixrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwRSxDQUFDIn0=