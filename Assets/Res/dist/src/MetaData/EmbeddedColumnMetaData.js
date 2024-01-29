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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL0VtYmVkZGVkQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSzFELE1BQU0sT0FBTyx3QkFBd0I7SUFDakMsSUFBVyxZQUFZO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDRCxZQUFZLE1BQXVDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BDLENBQUM7Q0FNSiJ9