import "reflect-metadata";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { columnMetaKey } from "../DecoratorKey";
export function ColumnDescription(description) {
    return (target, propertyKey) => {
        let columnMetaData = Reflect.getOwnMetadata(columnMetaKey, target.constructor, propertyKey);
        if (columnMetaData == null) {
            columnMetaData = new ColumnMetaData();
        }
        columnMetaData.description = description;
        Reflect.defineMetadata(columnMetaKey, columnMetaData, target.constructor, propertyKey);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uRGVzY3JpcHRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvQ29sdW1uL0NvbHVtbkRlc2NyaXB0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsV0FBbUI7SUFDakQsT0FBTyxDQUFDLE1BQWMsRUFBRSxXQUFtQixFQUFFLEVBQUU7UUFDM0MsSUFBSSxjQUFjLEdBQXdCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakgsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFLENBQUM7WUFDekIsY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUNELGNBQWMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztBQUNOLENBQUMifQ==