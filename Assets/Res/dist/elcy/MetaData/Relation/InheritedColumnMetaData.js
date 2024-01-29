import { ColumnMetaData } from "../ColumnMetaData";
export class InheritedColumnMetaData {
    get columnName() {
        return this.parentColumnMetaData.columnName;
    }
    get propertyName() {
        return this.parentColumnMetaData.propertyName;
    }
    get nullable() {
        return this.parentColumnMetaData.nullable;
    }
    get defaultExp() {
        return this.parentColumnMetaData.defaultExp;
    }
    get description() {
        return this.parentColumnMetaData.description;
    }
    get columnType() {
        return this.parentColumnMetaData.columnType;
    }
    get type() {
        return this.parentColumnMetaData.type;
    }
    get collation() {
        return this.parentColumnMetaData.collation;
    }
    get charset() {
        return this.parentColumnMetaData.charset;
    }
    get parentEntity() {
        return this.parentColumnMetaData.entity;
    }
    constructor(entity, parentColumnMetaData) {
        this.entity = entity;
        this.parentColumnMetaData = parentColumnMetaData;
        if (parentColumnMetaData instanceof InheritedColumnMetaData) {
            this.parentColumnMetaData = parentColumnMetaData.parentColumnMetaData;
        }
        else if (parentColumnMetaData instanceof ColumnMetaData) {
            this.parentColumnMetaData = parentColumnMetaData;
        }
    }
    /**
     * Copy
     */
    applyOption(columnMeta) {
        if (columnMeta instanceof InheritedColumnMetaData) {
            this.parentColumnMetaData = columnMeta.parentColumnMetaData;
        }
        else if (columnMeta instanceof ColumnMetaData) {
            this.parentColumnMetaData = columnMeta;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oZXJpdGVkQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTWV0YURhdGEvUmVsYXRpb24vSW5oZXJpdGVkQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSW5ELE1BQU0sT0FBTyx1QkFBdUI7SUFDaEMsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztJQUNoRCxDQUFDO0lBQ0QsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQztJQUNsRCxDQUFDO0lBQ0QsSUFBVyxRQUFRO1FBQ2YsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDO0lBQzlDLENBQUM7SUFDRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDO0lBQ2pELENBQUM7SUFDRCxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFXLElBQUk7UUFDWCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7SUFDMUMsQ0FBQztJQUNELElBQVcsU0FBUztRQUNoQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUM7SUFDL0MsQ0FBQztJQUNELElBQVcsT0FBTztRQUNkLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQztJQUM3QyxDQUFDO0lBQ0QsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztJQUM1QyxDQUFDO0lBQ0QsWUFBbUIsTUFBMkIsRUFBUyxvQkFBNEM7UUFBaEYsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFBUyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXdCO1FBQy9GLElBQUksb0JBQW9CLFlBQVksdUJBQXVCLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsb0JBQW9CLENBQUM7UUFDMUUsQ0FBQzthQUNJLElBQUksb0JBQW9CLFlBQVksY0FBYyxFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO1FBQ3JELENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxXQUFXLENBQUMsVUFBNkI7UUFDNUMsSUFBSSxVQUFVLFlBQVksdUJBQXVCLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDO1FBQ2hFLENBQUM7YUFDSSxJQUFJLFVBQVUsWUFBWSxjQUFjLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBZ0MsQ0FBQztRQUNqRSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=