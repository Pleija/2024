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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25EYXRhTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvUmVsYXRpb24vUmVsYXRpb25EYXRhTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBUTdELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVELE1BQU0sT0FBTyxvQkFBb0I7SUFDN0IsSUFBVyxvQkFBb0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7SUFDeEQsQ0FBQztJQUNELElBQVcsV0FBVztRQUNsQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEYsQ0FBQztJQUNELElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUMxQyxDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFDRCxZQUFZLGNBQTREO1FBVWpFLFlBQU8sR0FBa0MsRUFBRSxDQUFDO1FBQzVDLGdCQUFXLEdBQXNDLEVBQUUsQ0FBQztRQUNwRCxZQUFPLEdBQWlDLEVBQUUsQ0FBQztRQUkzQyxjQUFTLEdBQXlDLEVBQUUsQ0FBQztRQUNyRCwwQkFBcUIsR0FBa0MsRUFBRSxDQUFDO1FBQzFELHVCQUFrQixHQUEwRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXRGLDBCQUFxQixHQUFrQyxFQUFFLENBQUM7UUFDMUQsdUJBQWtCLEdBQTBELElBQUksR0FBRyxFQUFFLENBQUM7UUFwQnpGLElBQUksQ0FBQyxXQUFXLEdB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