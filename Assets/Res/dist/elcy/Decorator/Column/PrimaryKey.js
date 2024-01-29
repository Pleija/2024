import "reflect-metadata";
import { AbstractEntityMetaData } from "../../MetaData/AbstractEntityMetaData";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { columnMetaKey, entityMetaKey } from "../DecoratorKey";
export function PrimaryKey() {
    return (target, propertyKey /* | symbol */) => {
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        if (!entityMetaData) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
            Reflect.defineMetadata(entityMetaKey, entityMetaData, target.constructor);
        }
        if (!entityMetaData.primaryKeys.any((o) => o.propertyName === propertyKey)) {
            let columnMeta = Reflect.getOwnMetadata(columnMetaKey, target.constructor, propertyKey);
            if (!columnMeta) {
                columnMeta = new ColumnMetaData();
                columnMeta.propertyName = propertyKey;
            }
            entityMetaData.primaryKeys.push(columnMeta);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpbWFyeUtleS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvQ29sdW1uL1ByaW1hcnlLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvRCxNQUFNLFVBQVUsVUFBVTtJQUN0QixPQUFPLENBQUssTUFBVSxFQUFFLFdBQXFCLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDNUQsSUFBSSxjQUFjLEdBQXdCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEIsY0FBYyxHQUFHLElBQUksc0JBQXNCLENBQUMsTUFBTSxDQUFDLFdBQThCLENBQUMsQ0FBQztZQUNuRixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN6RSxJQUFJLFVBQVUsR0FBd0IsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2QsVUFBVSxHQUFHLElBQUksY0FBYyxFQUFXLENBQUM7Z0JBQzNDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQzFDLENBQUM7WUFDRCxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9