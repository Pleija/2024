import "reflect-metadata";
import { entityMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
/**
 * Register before save event. only for concrete entity
 */
export function AfterLoad(handler) {
    return (target, propertyKey /* | symbol*/, descriptor) => {
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
            entityMetaData.afterLoad = handler;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWZ0ZXJMb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9FdmVudEhhbmRsZXIvQWZ0ZXJMb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFHMUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRDs7R0FFRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQVUsT0FBMkI7SUFDMUQsT0FBTyxDQUFDLE1BQStCLEVBQUUsV0FBb0IsQ0FBQyxhQUFhLEVBQUUsVUFBK0IsRUFBRSxFQUFFO1FBQzVHLE1BQU0sSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQXNCLENBQUM7UUFDOUUsSUFBSSxjQUFjLEdBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QixjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsSUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbkUsT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixjQUFjLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUN2QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9