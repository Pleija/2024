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
    return (target, propertyKey) => {
        const entConstructor = propertyKey ? target.constructor : target;
        if (!option.name) {
            option.name = `CK_${entConstructor.name}_${(propertyKey ? propertyKey : target.name)}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tDb25zdHJhaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0NoZWNrQ29uc3RyYWludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTlFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU0vQyxNQUFNLFVBQVUsY0FBYyxDQUFLLG1CQUFnRixFQUFFLEtBQStCO0lBQ2hKLElBQUksTUFBTSxHQUErQixFQUFTLENBQUM7SUFDbkQsUUFBUSxPQUFPLG1CQUFtQixFQUFFLENBQUM7UUFDakMsS0FBSyxRQUFRO1lBQ1QsTUFBTSxHQUFHLG1CQUEwQixDQUFDO1lBQ3BDLE1BQU07UUFDVixLQUFLLFVBQVU7WUFDWCxNQUFNLENBQUMsS0FBSyxHQUFHLG1CQUEwQixDQUFDO1lBQzFDLE1BQU07UUFDVixLQUFLLFFBQVE7WUFDVCxNQUFNLENBQUMsSUFBSSxHQUFHLG1CQUEwQixDQUFDO1lBQ3pDLE1BQU07SUFDZCxDQUFDO0lBQ0QsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBZ0MsRUFBRSxXQUFzQixFQUFFLEVBQUU7UUFDaEUsTUFBTSxjQUFjLEdBQW9CLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN6RixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUUsTUFBMEIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2hILENBQUM7UUFFRCxJQUFJLGNBQWMsR0FBeUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakcsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFLENBQUM7WUFDekIsY0FBYyxHQUFHLElBQUksc0JBQXNCLENBQUMsTUFBTSxDQUFDLFdBQWtCLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsSUFBSSxhQUFhLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsWUFBWSx1QkFBdUIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1SCxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFDRCxhQUFhLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkYsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzFFLENBQUMsQ0FBQztBQUNOLENBQUMifQ==