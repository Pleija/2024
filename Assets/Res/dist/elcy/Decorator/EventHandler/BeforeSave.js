import "reflect-metadata";
import { entityMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
/**
 * Register before save event. only for concrete
 * @handler: if named function was passed, then it will override last function with the same name
 */
export function BeforeSave(handler) {
    return (target, propertyKey, descriptor) => {
        const ctor = (propertyKey ? target.constructor : target);
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, ctor);
        if (!entityMetaData) {
            AbstractEntity()(ctor);
            entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        }
        if (!handler && descriptor && typeof descriptor.value === "function") {
            handler = descriptor.value;
        }
        if (handler) {
            entityMetaData.beforeSave = handler;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmVmb3JlU2F2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvRXZlbnRIYW5kbGVyL0JlZm9yZVNhdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUkxQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxVQUFVLENBQVUsT0FBc0Q7SUFDdEYsT0FBTyxDQUFDLE1BQStCLEVBQUUsV0FBcUIsRUFBRSxVQUErQixFQUFFLEVBQUU7UUFDL0YsTUFBTSxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBc0IsQ0FBQztRQUM5RSxJQUFJLGNBQWMsR0FBeUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xCLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxJQUFJLE9BQU8sVUFBVSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNuRSxPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNWLGNBQWMsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1FBQ3hDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDIn0=