/**字段信息 */
class DBColumn {
    /**字段名->key */
    prop;
    /**字段数据类型 */
    propType;
    /**数据库字段名称 */
    name;
    /**是否为主键 */
    pk;
    /**是否主键自增 */
    autoInc;
    /**是否唯一约束键 */
    unique;
    /**不允许为空 */
    notNull;
    /**默认值 */
    defaultValue;
    /**最大长度 */
    maxLength;
    constructor(p) {
        if (p) {
            this.prop = p.prop;
            this.propType = p.propType;
            this.name = p.name;
            this.pk = p.pk;
            this.autoInc = p.autoInc;
            this.unique = p.unique;
            this.notNull = p.notNull;
            this.defaultValue = p.defaultValue;
            this.maxLength = p.maxLength;
        }
    }
    encode(obj) {
        if (this.propType === "object" && obj !== undefined) {
        }
        return obj;
    }
    decode(obj) {
        if (this.propType === "object" && obj !== undefined) {
        }
        return obj;
    }
}
/**表信息 */
class DBTable {
    tableName;
    columns;
    constructor(data) {
        if (data) {
            this.tableName = data.tableName;
            this.columns = data.columns;
        }
        if (!this.columns)
            this.columns = [];
    }
}
export { DBColumn, DBTable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb2x1bW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlMy9EQkNvbHVtbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsVUFBVTtBQUNWLE1BQU0sUUFBUTtJQUNWLGNBQWM7SUFDUCxJQUFJLENBQVM7SUFDcEIsWUFBWTtJQUNMLFFBQVEsQ0FBUztJQUN4QixhQUFhO0lBQ04sSUFBSSxDQUFVO0lBQ3JCLFdBQVc7SUFDSixFQUFFLENBQVc7SUFDcEIsWUFBWTtJQUNMLE9BQU8sQ0FBVztJQUN6QixhQUFhO0lBQ04sTUFBTSxDQUFXO0lBQ3hCLFdBQVc7SUFDSixPQUFPLENBQVc7SUFDekIsU0FBUztJQUNGLFlBQVksQ0FBTztJQUMxQixVQUFVO0lBQ0gsU0FBUyxDQUFVO0lBQzFCLFlBQVksQ0FBcUI7UUFDN0IsSUFBSSxDQUFDLEVBQUU7WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUNNLE1BQU0sQ0FBQyxHQUFRO1FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtTQUVwRDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNNLE1BQU0sQ0FBQyxHQUFRO1FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtTQUVwRDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBRUQsU0FBUztBQUNULE1BQU0sT0FBTztJQUNGLFNBQVMsQ0FBVTtJQUNuQixPQUFPLENBQVk7SUFDMUIsWUFBWSxJQUF1QjtRQUMvQixJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDL0I7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0NBQ0o7QUFFRCxPQUFPLEVBQ0gsUUFBUSxFQUNSLE9BQU8sRUFDVixDQUFDIn0=