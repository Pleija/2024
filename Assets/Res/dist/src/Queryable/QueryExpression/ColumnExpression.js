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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vQ29sdW1uRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSzNELE1BQU0sT0FBTyxnQkFBZ0I7SUFDekIsSUFBVyxnQkFBZ0I7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekMsQ0FBQztJQUdELFlBQVksTUFBNkIsRUFBRSxnQkFBeUQsRUFBRSx1QkFBNEMsRUFBRSxVQUFtQixFQUFFLFNBQW1CLEVBQUUsVUFBb0IsRUFBRSxVQUF1QjtRQUN2TyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFLLGdCQUFvQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQTBDLENBQUM7WUFDN0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztZQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyx1QkFBa0MsQ0FBQztZQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQy9DLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBa0MsQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxHQUFHLHVCQUFtQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQ2pDLENBQUM7SUFDTCxDQUFDO0lBU00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzSCxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLFVBQVUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDO0lBQzFDLENBQUM7Q0FDSiJ9