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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTnVsbGFibGVDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbi9OdWxsYWJsZUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxVQUFVLGNBQWM7SUFDMUIsT0FBTyxDQUFDLE1BQWMsRUFBRSxXQUFtQixDQUFDLGFBQWEsQ0FBQSxvQ0FBb0MsRUFBRSxFQUFFO1FBQzdGLElBQUksY0FBYyxHQUF3QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pILElBQUksY0FBYyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3pCLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBTyxDQUFDO1FBQy9DLENBQUM7UUFDRCxjQUFjLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUMvQixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIn0=