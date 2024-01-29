import "reflect-metadata";
import { AbstractEntityMetaData } from "../MetaData/AbstractEntityMetaData";
import { CheckConstraintMetaData } from "../MetaData/CheckConstraintMetaData";
import { entityMetaKey } from "./DecoratorKey";
export function CheckContraint(optionOrCheckOrName, check) {
    let option = {};
    switch (typeof optionOrCheckOrName) {
        case "object":
            option = optionOrCheckOrName;
            break;
        case "function":
            option.check = optionOrCheckOrName;
            break;
        case "string":
            option.name = optionOrCheckOrName;
            break;
    }
    if (check) {
        option.check = check;
    }
    // @ts-ignore
    return (target, propertyKey) => {
        const entConstructor = propertyKey ? target.constructor : target;
        if (!option.name) {
            option.name = `CK_${entConstructor.name}_${(propertyKey ? propertyKey : target.name).toString()}`;
        }
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, entConstructor);
        if (entityMetaData == null) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
        }
        let checkMetaData = entityMetaData.constraints.first((o) => o instanceof CheckConstraintMetaData && o.name === option.name);
        if (checkMetaData) {
            entityMetaData.constraints.delete(checkMetaData);
        }
        checkMetaData = new CheckConstraintMetaData(option.name, entityMetaData, option.check);
        entityMetaData.constraints.push(checkMetaData);
        Reflect.defineMetadata(entityMetaKey, entityMetaData, entConstructor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tDb25zdHJhaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9DaGVja0NvbnN0cmFpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUU5RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFNL0MsTUFBTSxVQUFVLGNBQWMsQ0FBSyxtQkFBZ0YsRUFBRSxLQUErQjtJQUNoSixJQUFJLE1BQU0sR0FBK0IsRUFBUyxDQUFDO0lBQ25ELFFBQVEsT0FBTyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2pDLEtBQUssUUFBUTtZQUNULE1BQU0sR0FBRyxtQkFBMEIsQ0FBQztZQUNwQyxNQUFNO1FBQ1YsS0FBSyxVQUFVO1lBQ1gsTUFBTSxDQUFDLEtBQUssR0FBRyxtQkFBMEIsQ0FBQztZQUMxQyxNQUFNO1FBQ1YsS0FBSyxRQUFRO1lBQ1QsTUFBTSxDQUFDLElBQUksR0FBRyxtQkFBMEIsQ0FBQztZQUN6QyxNQUFNO0lBQ2QsQ0FBQztJQUNELElBQUksS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRUQsYUFBYTtJQUNiLE9BQU8sQ0FBQyxNQUFnQyxFQUFFLFdBQXNCLEVBQUUsRUFBRTtRQUNoRSxNQUFNLGNBQWMsR0FBb0IsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3pGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBRSxNQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7UUFDM0gsQ0FBQztRQUVELElBQUksY0FBYyxHQUF5QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNqRyxJQUFJLGNBQWMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN6QixjQUFjLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsV0FBa0IsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxJQUFJLGFBQWEsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLHVCQUF1QixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVILElBQUksYUFBYSxFQUFFLENBQUM7WUFDaEIsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUNELGFBQWEsR0FBRyxJQUFJLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RixjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9