import { ComputedColumnMetaData } from "../ComputedColumnMetaData";
export class InheritedComputedColumnMetaData extends ComputedColumnMetaData {
    get description() {
        return this.parentColumnMetaData.description;
    }
    get functionExpression() {
        return this.parentColumnMetaData.functionExpression;
    }
    get parentEntity() {
        return this.parentColumnMetaData.entity;
    }
    get propertyName() {
        return this.parentColumnMetaData.propertyName;
    }
    get type() {
        return this.parentColumnMetaData.type;
    }
    constructor(entity, parentColumnMetaData) {
        super();
        this.entity = entity;
        this.applyOption(parentColumnMetaData);
    }
    /**
     * Copy
     */
    applyOption(columnMeta) {
        if (columnMeta instanceof InheritedComputedColumnMetaData) {
            this.parentColumnMetaData = columnMeta.parentColumnMetaData;
        }
        else if (columnMeta instanceof ComputedColumnMetaData) {
            this.parentColumnMetaData = columnMeta;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oZXJpdGVkQ29tcHV0ZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9NZXRhRGF0YS9SZWxhdGlvbi9Jbmhlcml0ZWRDb21wdXRlZENvbHVtbk1ldGFEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSW5FLE1BQU0sT0FBTywrQkFBNEQsU0FBUSxzQkFBNkI7SUFDMUcsSUFBVyxXQUFXO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsSUFBVyxrQkFBa0I7UUFDekIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQTJDLENBQUM7SUFDakYsQ0FBQztJQUNELElBQVcsWUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7SUFDNUMsQ0FBQztJQUNELElBQVcsWUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUM7SUFDbEQsQ0FBQztJQUNELElBQVcsSUFBSTtRQUNYLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztJQUMxQyxDQUFDO0lBQ0QsWUFBbUIsTUFBK0IsRUFBRSxvQkFBbUQ7UUFDbkcsS0FBSyxFQUFFLENBQUM7UUFETyxXQUFNLEdBQU4sTUFBTSxDQUF5QjtRQUU5QyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUdEOztPQUVHO0lBQ0ksV0FBVyxDQUFDLFVBQTJCO1FBQzFDLElBQUksVUFBVSxZQUFZLCtCQUErQixFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRSxDQUFDO2FBQ0ksSUFBSSxVQUFVLFlBQVksc0JBQXNCLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBd0MsQ0FBQztRQUN6RSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=