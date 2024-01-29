import { entityMetaKey } from "../Decorator/DecoratorKey";
export class EmbeddedRelationMetaData {
    get relationType() {
        return "one";
    }
    constructor(option) {
        this.propertyName = option.propertyName;
        this.source = Reflect.getOwnMetadata(entityMetaKey, option.sourceType);
        this.target = Reflect.getOwnMetadata(entityMetaKey, option.targetType);
        this.prefix = option.prefix;
        this.nullable = option.nullable;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9FbWJlZGRlZENvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUsxRCxNQUFNLE9BQU8sd0JBQXdCO0lBQ2pDLElBQVcsWUFBWTtRQUNuQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsWUFBWSxNQUF1QztRQUMvQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQyxDQUFDO0NBTUoifQ==