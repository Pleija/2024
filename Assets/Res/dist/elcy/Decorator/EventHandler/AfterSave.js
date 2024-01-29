import "reflect-metadata";
import { entityMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
/**
 * Register before save event. only for concrete entity
 */
export function AfterSave(handler) {
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
            entityMetaData.afterSave = handler;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWZ0ZXJTYXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9FdmVudEhhbmRsZXIvQWZ0ZXJTYXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFJMUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRDs7R0FFRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQVUsT0FBbUQ7SUFDbEYsT0FBTyxDQUFDLE1BQStCLEVBQUUsV0FBcUIsRUFBRSxVQUErQixFQUFFLEVBQUU7UUFDL0YsTUFBTSxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBc0IsQ0FBQztRQUM5RSxJQUFJLGNBQWMsR0FBeUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xCLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxJQUFJLE9BQU8sVUFBVSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNuRSxPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNWLGNBQWMsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBQ3ZDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDIn0=