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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oZXJpdGVkQ29tcHV0ZWRDb2x1bW5NZXRhRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL01ldGFEYXRhL1JlbGF0aW9uL0luaGVyaXRlZENvbXB1dGVkQ29sdW1uTWV0YURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJbkUsTUFBTSxPQUFPLCtCQUE0RCxTQUFRLHNCQUE2QjtJQUMxRyxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDO0lBQ2pELENBQUM7SUFDRCxJQUFXLGtCQUFrQjtRQUN6QixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBMkMsQ0FBQztJQUNqRixDQUFDO0lBQ0QsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztJQUM1QyxDQUFDO0lBQ0QsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQztJQUNsRCxDQUFDO0lBQ0QsSUFBVyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO0lBQzFDLENBQUM7SUFDRCxZQUFtQixNQUErQixFQUFFLG9CQUFtRDtRQUNuRyxLQUFLLEVBQUUsQ0FBQztRQURPLFdBQU0sR0FBTixNQUFNLENBQXlCO1FBRTlDLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR0Q7O09BRUc7SUFDSSxXQUFXLENBQUMsVUFBMkI7UUFDMUMsSUFBSSxVQUFVLFlBQVksK0JBQStCLEVBQUUsQ0FBQztZQUN4RCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDO1FBQ2hFLENBQUM7YUFDSSxJQUFJLFVBQVUsWUFBWSxzQkFBc0IsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUF3QyxDQUFDO1FBQ3pFLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==