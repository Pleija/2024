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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pcXVlQ29uc3RyYWludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RlY29yYXRvci9VbmlxdWVDb25zdHJhaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRzVFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFNOUQsTUFBTSxVQUFVLGdCQUFnQixDQUFLLHdCQUE2RixFQUFFLFVBQXdDO0lBQ3hLLElBQUksTUFBTSxHQUFnQyxFQUFFLENBQUM7SUFDN0MsUUFBUSxPQUFPLHdCQUF3QixFQUFFLENBQUM7UUFDdEMsS0FBSyxRQUFRO1lBQ1QsTUFBTSxHQUFHLHdCQUErQixDQUFDO1lBQ3pDLE1BQU07UUFDVixLQUFLLFVBQVU7WUFDWCxVQUFVLEdBQUcsd0JBQStCLENBQUM7WUFDN0MsTUFBTTtRQUNWLEtBQUssUUFBUTtZQUNULE1BQU0sQ0FBQyxJQUFJLEdBQUcsd0JBQStCLENBQUM7WUFDOUMsTUFBTTtJQUNkLENBQUM7SUFDRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2IsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDbkMsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUFnQyxFQUFFLFdBQXNCLEVBQUUsRUFBRTtRQUNoRSxNQUFNLGNBQWMsR0FBb0IsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3pGLElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEMsQ0FBQzthQUNJLENBQUM7WUFDRixNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVO2lCQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6RSxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdHLENBQUM7UUFFRCxJQUFJLGNBQWMsR0FBeUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakcsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFLENBQUM7WUFDekIsY0FBYyxHQUFHLElBQUksc0JBQXNCLENBQUMsTUFBTSxDQUFDLFdBQWtCLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsSUFBSSxhQUFhLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsWUFBWSx3QkFBd0IsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3SCxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVTthQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBYSxDQUFvQixDQUFDO2FBQzNHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNmLGFBQWEsR0FBRyxJQUFJLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25GLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUM7QUFDTixDQUFDIn0=