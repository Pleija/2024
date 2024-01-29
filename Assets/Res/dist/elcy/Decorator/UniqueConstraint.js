import "reflect-metadata";
import { FunctionHelper } from "../Helper/FunctionHelper";
import { AbstractEntityMetaData } from "../MetaData/AbstractEntityMetaData";
import { UniqueConstraintMetaData } from "../MetaData/UniqueConstraintMetaData";
import { columnMetaKey, entityMetaKey } from "./DecoratorKey";
export function UniqueConstraint(optionOrPropertiesOrName, properties) {
    let option = {};
    switch (typeof optionOrPropertiesOrName) {
        case "object":
            option = optionOrPropertiesOrName;
            break;
        case "function":
            properties = optionOrPropertiesOrName;
            break;
        case "string":
            option.name = optionOrPropertiesOrName;
            break;
    }
    if (properties) {
        option.properties = properties;
    }
    return (target, propertyKey) => {
        const entConstructor = propertyKey ? target.constructor : target;
        if (propertyKey) {
            option.properties = [propertyKey];
        }
        else {
            option.properties = option.properties
                .select((o) => typeof o === "string" ? o : FunctionHelper.propertyName(o))
                .toArray();
        }
        if (!option.name) {
            option.name = `UQ_${entConstructor.name}${(option.properties ? "_" + option.properties.join("_") : "")}`;
        }
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, entConstructor);
        if (entityMetaData == null) {
            entityMetaData = new AbstractEntityMetaData(target.constructor);
        }
        let checkMetaData = entityMetaData.constraints.first((o) => o instanceof UniqueConstraintMetaData && o.name === option.name);
        if (checkMetaData) {
            entityMetaData.constraints.delete(checkMetaData);
        }
        const columns = option.properties
            .select((o) => Reflect.getOwnMetadata(columnMetaKey, entityMetaData.type, o))
            .where((o) => !!o)
            .toArray();
        checkMetaData = new UniqueConstraintMetaData(option.name, entityMetaData, columns);
        entityMetaData.constraints.push(checkMetaData);
        Reflect.defineMetadata(entityMetaKey, entityMetaData, entConstructor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pcXVlQ29uc3RyYWludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EZWNvcmF0b3IvVW5pcXVlQ29uc3RyYWludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUc1RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoRixPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBTTlELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBSyx3QkFBNkYsRUFBRSxVQUF3QztJQUN4SyxJQUFJLE1BQU0sR0FBZ0MsRUFBRSxDQUFDO0lBQzdDLFFBQVEsT0FBTyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNULE1BQU0sR0FBRyx3QkFBK0IsQ0FBQztZQUN6QyxNQUFNO1FBQ1YsS0FBSyxVQUFVO1lBQ1gsVUFBVSxHQUFHLHdCQUErQixDQUFDO1lBQzdDLE1BQU07UUFDVixLQUFLLFFBQVE7WUFDVCxNQUFNLENBQUMsSUFBSSxHQUFHLHdCQUErQixDQUFDO1lBQzlDLE1BQU07SUFDZCxDQUFDO0lBQ0QsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNiLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ25DLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBZ0MsRUFBRSxXQUFzQixFQUFFLEVBQUU7UUFDaEUsTUFBTSxjQUFjLEdBQW9CLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN6RixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVTtpQkFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekUsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3RyxDQUFDO1FBRUQsSUFBSSxjQUFjLEdBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2pHLElBQUksY0FBYyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3pCLGNBQWMsR0FBRyxJQUFJLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxXQUFrQixDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELElBQUksYUFBYSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksd0JBQXdCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0gsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNoQixjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVU7YUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFLENBQWEsQ0FBb0IsQ0FBQzthQUMzRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakIsT0FBTyxFQUFFLENBQUM7UUFDZixhQUFhLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRixjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9