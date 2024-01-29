import { ColumnGeneration } from "../Common/Enum";
import { InheritanceMetaData } from "./Relation/InheritanceMetaData";
export class EntityMetaData {
    get allowInheritance() {
        return !!this.descriminatorMember;
    }
    get hasIncrementPrimary() {
        return this.primaryKeys.any((o) => o.autoIncrement);
    }
    get insertGeneratedColumns() {
        return this.columns.where((o) => {
            return (o.generation & ColumnGeneration.Insert);
        }).toArray();
    }
    get priority() {
        let priority = 1;
        for (const relation of this.relations) {
            if (!relation.isMaster && !relation.nullable) {
                priority += relation.target.priority + 1;
            }
        }
        return priority;
    }
    get updateGeneratedColumns() {
        return this.columns.where((o) => {
            return (o.generation & ColumnGeneration.Update);
        }).toArray();
    }
    constructor(type, name) {
        this.type = type;
        this.columns = [];
        this.constraints = [];
        // inheritance
        this.descriminatorMember = "__type__";
        this.embeds = [];
        this.indices = [];
        this.primaryKeys = [];
        this.relations = [];
        this.schema = "dbo";
        this.inheritance = new InheritanceMetaData();
        if (typeof name !== "undefined") {
            this.name = name;
        }
        if (!name) {
            this.name = type.name;
        }
    }
    applyOption(entityMeta) {
        if (typeof entityMeta.columns !== "undefined") {
            this.columns = entityMeta.columns;
            this.columns.forEach((o) => o.entity = this);
        }
        if (typeof entityMeta.createDateColumn !== "undefined") {
            this.createDateColumn = entityMeta.createDateColumn;
        }
        if (typeof entityMeta.defaultOrders !== "undefined") {
            this.defaultOrders = entityMeta.defaultOrders;
        }
        if (typeof entityMeta.deletedColumn !== "undefined") {
            this.deletedColumn = entityMeta.deletedColumn;
        }
        if (typeof entityMeta.indices !== "undefined") {
            this.indices = entityMeta.indices;
        }
        if (typeof entityMeta.constraints !== "undefined") {
            this.constraints = entityMeta.constraints;
        }
        if (typeof entityMeta.modifiedDateColumn !== "undefined") {
            this.modifiedDateColumn = entityMeta.modifiedDateColumn;
        }
        if (typeof entityMeta.versionColumn !== "undefined") {
            this.versionColumn = entityMeta.versionColumn;
        }
        if (typeof entityMeta.primaryKeys !== "undefined") {
            this.primaryKeys = entityMeta.primaryKeys;
        }
        if (typeof entityMeta.relations !== "undefined") {
            this.relations = entityMeta.relations;
            for (const rel of this.relations) {
                rel.source = this;
                if (rel.reverseRelation) {
                    rel.reverseRelation.target = this;
                }
            }
        }
        if (typeof entityMeta.beforeDelete !== "undefined") {
            this.beforeDelete = entityMeta.beforeDelete;
        }
        if (typeof entityMeta.beforeSave !== "undefined") {
            this.beforeSave = entityMeta.beforeSave;
        }
        if (typeof entityMeta.afterLoad !== "undefined") {
            this.afterLoad = entityMeta.afterLoad;
        }
        if (typeof entityMeta.afterSave !== "undefined") {
            this.afterSave = entityMeta.afterSave;
        }
        if (typeof entityMeta.afterDelete !== "undefined") {
            this.afterDelete = entityMeta.afterDelete;
        }
        if (typeof entityMeta.concurrencyMode !== "undefined") {
            this.concurrencyMode = entityMeta.concurrencyMode;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5TWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvRW50aXR5TWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFlbEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFHckUsTUFBTSxPQUFPLGNBQWM7SUFDdkIsSUFBVyxnQkFBZ0I7UUFDdkIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ3RDLENBQUM7SUFDRCxJQUFXLG1CQUFtQjtRQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFrQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRCxJQUFXLHNCQUFzQjtRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFRLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUNELElBQVcsUUFBUTtRQUNmLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDM0MsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8s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