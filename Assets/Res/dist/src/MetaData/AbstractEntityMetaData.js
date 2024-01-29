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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RFbnRpdHlNZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL0Fic3RyYWN0RW50aXR5TWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJeEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBTWxELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXJFLE1BQU0sT0FBTyxzQkFBc0I7SUFDL0IsSUFBVyxzQkFBc0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzVCLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFRLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUNELElBQVcsc0JBQXNCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQVEsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsWUFBbUIsSUFBcUIsRUFBRSxJQUFhO1FBQXBDLFNBQUksR0FBSixJQUFJLENBQWlCO1FBaUJqQyxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDekIsWUFBTyxHQUErQixFQUFFLENBQUM7UUFDekMsZ0JBQVcsR0FBbUMsRUFBRSxDQUFDO1FBSWpELFlBQU8sR0FBNkIsRUFBRSxDQUFDO1FBT3ZDLGdCQUFXLEdBQStCLEVBQUUsQ0FBQztRQUM3QyxjQUFTLEdBQXNDLEVBQUUsQ0FBQztRQTlCckQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDN0MsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQXVCLENBQUM7UUFDM0UsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDM0IsTUFBTSxjQUFjLEdBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQy9GLElBQUksY0FBYyxZQUFZLGNBQWMsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDakMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBZ0JKIn0=