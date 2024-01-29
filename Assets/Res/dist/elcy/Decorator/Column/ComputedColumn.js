import "reflect-metadata";
import { AbstractEntityMetaData } from "../../MetaData/AbstractEntityMetaData";
import { ComputedColumnMetaData } from "../../MetaData/ComputedColumnMetaData";
import { columnMetaKey, entityMetaKey } from "../DecoratorKey";
// TODO: types: Persisted, Virtual, Query
export function ComputedColumn(fn) {
    return (target, propertyKey) => {
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        if (entityMetaData == null) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
            Reflect.defineMetadata(entityMetaKey, entityMetaData, target.constructor);
        }
        const computedMetaData = new ComputedColumnMetaData(entityMetaData, fn, propertyKey);
        entityMetaData.columns.push(computedMetaData);
        Reflect.defineMetadata(columnMetaKey, computedMetaData, target.constructor, propertyKey);
        const privatePropertySymbol = Symbol(propertyKey);
        const descriptor = {
            configurable: true,
            enumerable: true,
            get: function () {
                const value = this[privatePropertySymbol];
                if (typeof value === "undefined") {
                    try {
                        return fn(this);
                    }
                    catch (e) { }
                }
                return value;
            },
            set: function (value) {
                if (!this.hasOwnProperty(privatePropertySymbol)) {
                    Object.defineProperty(this, privatePropertySymbol, {
                        configurable: true,
                        enumerable: false,
                        value: undefined,
                        writable: true
                    });
                }
                this[privatePropertySymbol] = value;
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL0NvbHVtbi9Db21wdXRlZENvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRS9FLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0QseUNBQXlDO0FBQ3pDLE1BQU0sVUFBVSxjQUFjLENBQW1CLEVBQWU7SUFDNUQsT0FBTyxDQUFDLE1BQVMsRUFBRSxXQUFvQixFQUFFLEVBQUU7UUFDdkMsSUFBSSxjQUFjLEdBQXVCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRyxJQUFJLGNBQWMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN6QixjQUFjLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsV0FBa0IsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JGLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV6RixNQUFNLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRCxNQUFNLFVBQVUsR0FBdUI7WUFDbkMsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsR0FBRyxFQUFFO2dCQUNELE1BQU0sS0FBSyxHQUFJLElBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUM7d0JBQ0QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLENBQUM7b0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELEdBQUcsRUFBRSxVQUFxQixLQUFRO2dCQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO3dCQUMvQyxZQUFZLEVBQUUsSUFBSTt3QkFDbEIsVUFBVSxFQUFFLEtBQUs7d0JBQ2pCLEtBQUssRUFBRSxTQUFTO3dCQUNoQixRQUFRLEVBQUUsSUFBSTtxQkFDakIsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQ0EsSUFBWSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ2pELENBQUM7U0FDSixDQUFDO1FBQ0YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNELENBQUMsQ0FBQztBQUNOLENBQUMifQ==