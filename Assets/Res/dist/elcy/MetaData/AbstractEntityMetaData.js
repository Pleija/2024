import { ClassBase } from "../Common/Constant";
import { ColumnGeneration } from "../Common/Enum";
import { entityMetaKey } from "../Decorator/DecoratorKey";
import { isNull } from "../Helper/Util";
import { EntityMetaData } from "./EntityMetaData";
import { InheritanceMetaData } from "./Relation/InheritanceMetaData";
export class AbstractEntityMetaData {
    get insertGeneratedColumns() {
        return this.columns.where((o) => {
            return isNull(o.defaultExp) || (o.generation & ColumnGeneration.Insert);
        }).toArray();
    }
    get updateGeneratedColumns() {
        return this.columns.where((o) => {
            return (o.generation & ColumnGeneration.Update);
        }).toArray();
    }
    constructor(type, name) {
        this.type = type;
        this.allowInheritance = false;
        this.columns = [];
        this.constraints = [];
        this.indices = [];
        this.primaryKeys = [];
        this.relations = [];
        this.inheritance = new InheritanceMetaData();
        if (typeof name !== "undefined") {
            this.name = name;
        }
        if (!name) {
            this.name = type.name;
        }
        const parentType = Reflect.getPrototypeOf(this.type);
        if (parentType !== ClassBase) {
            const parentMetaData = Reflect.getOwnMetadata(entityMetaKey, parentType);
            if (parentMetaData instanceof EntityMetaData && parentMetaData.allowInheritance) {
                this.parentType = parentType;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RFbnRpdHlNZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9BYnN0cmFjdEVudGl0eU1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSXhDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQU1sRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxNQUFNLE9BQU8sc0JBQXNCO0lBQy9CLElBQVcsc0JBQXNCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM1QixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBUSxDQUFDO1FBQ25GLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDRCxJQUFXLHNCQUFzQjtRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFRLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELFlBQW1CLElBQXFCLEVBQUUsSUFBYTtRQUFwQyxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQWlCakMscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLFlBQU8sR0FBK0IsRUFBRSxDQUFDO1FBQ3pDLGdCQUFXLEdBQW1DLEVBQUUsQ0FBQztRQUlqRCxZQUFPLEdBQTZCLEVBQUUsQ0FBQztRQU92QyxnQkFBVyxHQUErQixFQUFFLENBQUM7UUFDN0MsY0FBUyxHQUFzQyxFQUFFLENBQUM7UUE5QnJELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQzdDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUF1QixDQUFDO1FBQzNFLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzNCLE1BQU0sY0FBYyxHQUF5QixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvRixJQUFJLGNBQWMsWUFBWSxjQUFjLElBQUksY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ2pDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQWdCSiJ9