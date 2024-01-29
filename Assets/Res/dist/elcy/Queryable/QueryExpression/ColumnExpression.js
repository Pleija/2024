import { hashCode, resolveClone } from "../../Helper/Util";
export class ColumnExpression {
    get dataPropertyName() {
        return this.alias || this.columnName;
    }
    constructor(entity, columnMetaOrType, isPrimaryOrPropertyName, columnName, isPrimary, isNullable, columnType) {
        this.entity = entity;
        if (columnMetaOrType.entity) {
            this.columnMeta = columnMetaOrType;
            this.type = this.columnMeta.type;
            this.propertyName = this.columnMeta.propertyName;
            this.columnName = this.columnMeta.columnName;
            this.isPrimary = isPrimaryOrPropertyName;
            this.isNullable = this.columnMeta.nullable;
        }
        else {
            this.type = columnMetaOrType;
            this.propertyName = isPrimaryOrPropertyName;
            this.columnName = columnName;
            this.isPrimary = isPrimary;
            this.isNullable = isNullable;
        }
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const entity = resolveClone(this.entity, replaceMap);
        const clone = new ColumnExpression(entity, this.type, this.propertyName, this.columnName, this.isPrimary, this.isNullable);
        clone.columnMeta = this.columnMeta;
        clone.alias = this.alias;
        clone.isNullable = this.isNullable;
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode(this.propertyName, hashCode(this.columnName, this.entity.hashCode()));
    }
    toString() {
        return `Column(${this.propertyName})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0NvbHVtbkV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUszRCxNQUFNLE9BQU8sZ0JBQWdCO0lBQ3pCLElBQVcsZ0JBQWdCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFHRCxZQUFZLE1BQTZCLEVBQUUsZ0JBQXlELEVBQUUsdUJBQTRDLEVBQUUsVUFBbUIsRUFBRSxTQUFtQixFQUFFLFVBQW9CLEVBQUUsVUFBdUI7UUFDdk8sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSyxnQkFBb0MsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUEwQyxDQUFDO1lBQzdELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsdUJBQWtDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWtDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFlBQVksR0FBRyx1QkFBbUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQVNNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckQsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0gsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxVQUFVLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==