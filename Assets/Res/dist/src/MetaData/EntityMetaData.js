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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5TWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9FbnRpdHlNZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWVsRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUdyRSxNQUFNLE9BQU8sY0FBYztJQUN2QixJQUFXLGdCQUFnQjtRQUN2QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDdEMsQ0FBQztJQUNELElBQVcsbUJBQW1CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQWtDLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVELElBQVcsc0JBQXNCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQVEsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ0QsSUFBVyxRQUFRO1FBQ2YsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMzQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxR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