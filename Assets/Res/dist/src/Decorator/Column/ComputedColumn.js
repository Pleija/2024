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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHV0ZWRDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvQ29sdW1uL0NvbXB1dGVkQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvRCx5Q0FBeUM7QUFDekMsTUFBTSxVQUFVLGNBQWMsQ0FBbUIsRUFBZTtJQUM1RCxPQUFPLENBQUMsTUFBUyxFQUFFLFdBQW9CLEVBQUUsRUFBRTtRQUN2QyxJQUFJLGNBQWMsR0FBdUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25HLElBQUksY0FBYyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3pCLGNBQWMsR0FBRyxJQUFJLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxXQUFrQixDQUFDLENBQUM7WUFDdkUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDckYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXpGLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sVUFBVSxHQUF1QjtZQUNuQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtZQUNoQixHQUFHLEVBQUU7Z0JBQ0QsTUFBTSxLQUFLLEdBQUksSUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ25ELElBQUksT0FBTyxLQUFLLEtBQUssV0FBVyxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FBQzt3QkFDRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsQ0FBQztvQkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsR0FBRyxFQUFFLFVBQXFCLEtBQVE7Z0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztvQkFDOUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7d0JBQy9DLFlBQVksRUFBRSxJQUFJO3dCQUNsQixVQUFVLEVBQUUsS0FBSzt3QkFDakIsS0FBSyxFQUFFLFNBQVM7d0JBQ2hCLFFBQVEsRUFBRSxJQUFJO3FCQUNqQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFDQSxJQUFZLENBQUMscUJBQXFCLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDakQsQ0FBQztTQUNKLENBQUM7UUFDRixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9