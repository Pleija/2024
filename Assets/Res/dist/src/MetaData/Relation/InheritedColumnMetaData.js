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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oZXJpdGVkQ29sdW1uTWV0YURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9NZXRhRGF0YS9SZWxhdGlvbi9Jbmhlcml0ZWRDb2x1bW5NZXRhRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJbkQsTUFBTSxPQUFPLHVCQUF1QjtJQUNoQyxJQUFXLFVBQVU7UUFDakIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFXLFlBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDO0lBQ2xELENBQUM7SUFDRCxJQUFXLFFBQVE7UUFDZixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7SUFDOUMsQ0FBQztJQUNELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUM7SUFDaEQsQ0FBQztJQUNELElBQVcsV0FBVztRQUNsQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUM7SUFDakQsQ0FBQztJQUNELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUM7SUFDaEQsQ0FBQztJQUNELElBQVcsSUFBSTtRQUNYLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBQ0QsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsSUFBVyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDO0lBQzdDLENBQUM7SUFDRCxJQUFXLFlBQVk7UUFDbkIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDO0lBQzVDLENBQUM7SUFDRCxZQUFtQixNQUEyQixFQUFTLG9CQUE0QztRQUFoRixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUFTLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBd0I7UUFDL0YsSUFBSSxvQkFBb0IsWUFBWSx1QkFBdUIsRUFBRSxDQUFDO1lBQzFELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQztRQUMxRSxDQUFDO2FBQ0ksSUFBSSxvQkFBb0IsWUFBWSxjQUFjLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7UUFDckQsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLFdBQVcsQ0FBQyxVQUE2QjtRQUM1QyxJQUFJLFVBQVUsWUFBWSx1QkFBdUIsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUMsb0JBQW9CLENBQUM7UUFDaEUsQ0FBQzthQUNJLElBQUksVUFBVSxZQUFZLGNBQWMsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFnQyxDQUFDO1FBQ2pFLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==