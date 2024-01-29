import "reflect-metadata";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { columnMetaKey } from "../DecoratorKey";
export function NullableColumn() {
    return (target, propertyKey /* | symbol*/ /*, descriptor: PropertyDescriptor*/) => {
        let columnMetaData = Reflect.getOwnMetadata(columnMetaKey, target.constructor, propertyKey);
        if (columnMetaData == null) {
            columnMetaData = new ColumnMetaData();
        }
        columnMetaData.nullable = true;
        Reflect.defineMetadata(columnMetaKey, columnMetaData, target.constructor, propertyKey);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTnVsbGFibGVDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvQ29sdW1uL051bGxhYmxlQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLFVBQVUsY0FBYztJQUMxQixPQUFPLENBQUMsTUFBYyxFQUFFLFdBQW1CLENBQUMsYUFBYSxDQUFBLG9DQUFvQyxFQUFFLEVBQUU7UUFDN0YsSUFBSSxjQUFjLEdBQXdCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakgsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFLENBQUM7WUFDekIsY0FBYyxHQUFHLElBQUksY0FBYyxFQUFPLENBQUM7UUFDL0MsQ0FBQztRQUNELGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztBQUNOLENBQUMifQ==