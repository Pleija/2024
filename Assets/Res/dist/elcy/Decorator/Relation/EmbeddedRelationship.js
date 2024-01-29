import "reflect-metadata";
import { EmbeddedRelationMetaData } from "../../MetaData/EmbeddedColumnMetaData";
import { relationMetaKey } from "../DecoratorKey";
export function EmbeddedRelationship(optionOrType, prefix, nullable) {
    let option = {};
    if (optionOrType instanceof Function) {
        option.targetType = optionOrType;
        option.prefix = prefix;
        option.nullable = nullable;
    }
    else {
        option = optionOrType;
    }
    return (target, propertyKey) => {
        option.sourceType = target.constructor;
        option.propertyName = propertyKey;
        const embeddedRelationMeta = new EmbeddedRelationMetaData(option);
        Reflect.defineMetadata(relationMetaKey, embeddedRelationMeta, option.sourceType, propertyKey);
        const source = embeddedRelationMeta.source;
        source.embeds.push(embeddedRelationMeta);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRSZWxhdGlvbnNoaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRGVjb3JhdG9yL1JlbGF0aW9uL0VtYmVkZGVkUmVsYXRpb25zaGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDakYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBS2xELE1BQU0sVUFBVSxvQkFBb0IsQ0FBbUIsWUFBNEQsRUFBRSxNQUFlLEVBQUUsUUFBa0I7SUFDcEosSUFBSSxNQUFNLEdBQWtDLEVBQUUsQ0FBQztJQUMvQyxJQUFJLFlBQVksWUFBWSxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLFlBQW1CLENBQUM7UUFDeEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkIsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDL0IsQ0FBQztTQUNJLENBQUM7UUFDRixNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBUyxFQUFFLFdBQW9CLEVBQUUsRUFBRTtRQUN2QyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFrQixDQUFDO1FBQzlDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsVUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRS9GLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztRQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQztBQUNOLENBQUMifQ==