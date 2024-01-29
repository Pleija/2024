import "reflect-metadata";
import { entityMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
/**
 * Register before save event. only for concrete entity
 */
export function BeforeDelete(handler) {
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
            entityMetaData.beforeDelete = handler;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmVmb3JlRGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0V2ZW50SGFuZGxlci9CZWZvcmVEZWxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUkxQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBVyxPQUEwRDtJQUM3RixPQUFPLENBQUMsTUFBZ0MsRUFBRSxXQUFzQixFQUFFLFVBQStCLEVBQUUsRUFBRTtRQUNqRyxNQUFNLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFzQixDQUFDO1FBQzlFLElBQUksY0FBYyxHQUF5QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEIsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxVQUFVLElBQUksT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ25FLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1YsY0FBYyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUMifQ==