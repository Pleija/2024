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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uRGVzY3JpcHRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbi9Db2x1bW5EZXNjcmlwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFdBQW1CO0lBQ2pELE9BQU8sQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxFQUFFO1FBQzNDLElBQUksY0FBYyxHQUF3QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pILElBQUksY0FBYyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3pCLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFDRCxjQUFjLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUN6QyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7QUFDTixDQUFDIn0=