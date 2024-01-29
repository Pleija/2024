import "reflect-metadata";
import { entityMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
/**
 * Register before save event. only for concrete entity
 */
export function AfterDelete(handler) {
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
            entityMetaData.afterDelete = handler;
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWZ0ZXJEZWxldGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0V2ZW50SGFuZGxlci9BZnRlckRlbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBSTFCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFXLE9BQXNEO0lBQ3hGLE9BQU8sQ0FBQyxNQUFnQyxFQUFFLFdBQXNCLEVBQUUsVUFBK0IsRUFBRSxFQUFFO1FBQ2pHLE1BQU0sSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQXNCLENBQUM7UUFDOUUsSUFBSSxjQUFjLEdBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QixjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsSUFBSSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbkUsT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixjQUFjLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUN6QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9