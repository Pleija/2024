import { columnMetaKey } from "../../Decorator/DecoratorKey";
import { InheritanceMetaData } from "./InheritanceMetaData";
export class RelationDataMetaData {
    get completeRelationType() {
        return this.sourceRelationMeta.completeRelationType;
    }
    get primaryKeys() {
        return this.sourceRelationColumns.union(this.targetRelationColumns).toArray();
    }
    get source() {
        return this.sourceRelationMeta.source;
    }
    get target() {
        return this.targetRelationMeta.source;
    }
    constructor(relationOption) {
        this.columns = [];
        this.constraints = [];
        this.indices = [];
        this.relations = [];
        this.sourceRelationColumns = [];
        this.sourceRelationMaps = new Map();
        this.targetRelationColumns = [];
        this.targetRelationMaps = new Map();
        this.inheritance = new InheritanceMetaData();
        this.name = relationOption.name;
        this.relationName = relationOption.relationName;
        // TODO: possible failed coz relationOption.targetType / sourceType may undefined|string
        this.sourceRelationColumns = relationOption.sourceRelationKeys.select((o) => Reflect.getOwnMetadata(columnMetaKey, relationOption.type, o)).toArray();
        this.targetRelationColumns = relationOption.targetRelationKeys.select((o) => Reflect.getOwnMetadata(columnMetaKey, relationOption.type, o)).toArray();
        this.type = relationOption.type;
    }
    ApplyOption(entityMeta) {
        if (typeof entityMeta.columns !== "undefined") {
            this.columns = entityMeta.columns;
            this.columns.forEach((o) => o.entity = this);
        }
    }
    completeRelation(sourceRelation, targetRelation) {
        this.sourceRelationMeta = sourceRelation;
        this.targetRelationMeta = targetRelation;
        sourceRelation.relationData = this;
        targetRelation.relationData = this;
        sourceRelation.isMaster = targetRelation.isMaster = true;
        this.sourceRelationMaps = new Map();
        this.targetRelationMaps = new Map();
        this.sourceRelationMeta.completeRelation(this.targetRelationMeta);
        const isManyToMany = (this.sourceRelationMeta.relationType === "many") && (this.targetRelationMeta.relationType === "many");
        const len = this.sourceRelationColumns.length;
        for (let i = 0; i < len; i++) {
            const dataKey = this.sourceRelationColumns[i];
            const sourceKey = this.sourceRelationMeta.relationColumns[i];
            this.sourceRelationMaps.set(dataKey, sourceKey);
            if (isManyToMany) {
                this.sourceRelationMeta.relationMaps.set(sourceKey, dataKey);
            }
        }
        for (let i = 0; i < len; i++) {
            const dataKey = this.targetRelationColumns[i];
            const targetKey = this.targetRelationMeta.relationColumns[i];
            this.targetRelationMaps.set(dataKey, targetKey);
            if (isManyToMany) {
                this.targetRelationMeta.relationMaps.set(targetKey, dataKey);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25EYXRhTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9SZWxhdGlvbi9SZWxhdGlvbkRhdGFNZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFRN0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQsTUFBTSxPQUFPLG9CQUFvQjtJQUM3QixJQUFXLG9CQUFvQjtRQUMzQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsSUFBVyxXQUFXO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNsRixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFDRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7SUFDMUMsQ0FBQztJQUNELFlBQVksY0FBNEQ7UUFVakUsWUFBTyxHQUFrQyxFQUFFLENBQUM7UUFDNUMsZ0JBQVcsR0FBc0MsRUFBRSxDQUFDO1FBQ3BELFlBQU8sR0FBaUMsRUFBRSxDQUFDO1FBSTNDLGNBQVMsR0FBeUMsRUFBRSxDQUFDO1FBQ3JELDBCQUFxQixHQUFrQyxFQUFFLENBQUM7UUFDMUQsdUJBQWtCLEdBQTBELElBQUksR0FBRyxFQUFFLENBQUM7UUFFdEYsMEJBQXFCLEdBQWtDLEVBQUUsQ0FBQztRQUMxRCx1QkFBa0IsR0FBMEQsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQXBCekYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQztRQUVoRCx3RkFBd0Y7UUFDeEYsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0SixJQUFJLENBQUMscUJBQXFCLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RKLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztJQUNwQyxDQUFDO0lBZU0sV0FBVyxDQUFDLFVBQWtDO1FBQ2pELElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0wsQ0FBQztJQUNNLGdCQUFnQixDQUFDLGNBQW1ELEVBQUUsY0FBbUQ7UUFDNUgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztRQUN6QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsY0FBYyxDQUFDO1FBQ3pDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ25DLGNBQWMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ25DLGNBQWMsQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFekQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEtBQUssTUFBTSxDQUFDLENBQUM7UUFDNUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztRQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEQsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBMEIsQ0FBQyxDQUFDO1lBQ3BGLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQTBCLENBQUMsQ0FBQztZQUNwRixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9