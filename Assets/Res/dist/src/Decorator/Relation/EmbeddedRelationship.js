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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRSZWxhdGlvbnNoaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9EZWNvcmF0b3IvUmVsYXRpb24vRW1iZWRkZWRSZWxhdGlvbnNoaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNqRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFLbEQsTUFBTSxVQUFVLG9CQUFvQixDQUFtQixZQUE0RCxFQUFFLE1BQWUsRUFBRSxRQUFrQjtJQUNwSixJQUFJLE1BQU0sR0FBa0MsRUFBRSxDQUFDO0lBQy9DLElBQUksWUFBWSxZQUFZLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBbUIsQ0FBQztRQUN4QyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMvQixDQUFDO1NBQ0ksQ0FBQztRQUNGLE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDMUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUFTLEVBQUUsV0FBb0IsRUFBRSxFQUFFO1FBQ3ZDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFdBQWtCLENBQUM7UUFDOUMsTUFBTSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDbEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxVQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFL0YsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDO0FBQ04sQ0FBQyJ9