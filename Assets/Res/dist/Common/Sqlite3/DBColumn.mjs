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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb2x1bW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlMy9EQkNvbHVtbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsVUFBVTtBQUNWLE1BQU0sUUFBUTtJQUNWLGNBQWM7SUFDUCxJQUFJLENBQVM7SUFDcEIsWUFBWTtJQUNMLFFBQVEsQ0FBUztJQUN4QixhQUFhO0lBQ04sSUFBSSxDQUFVO0lBQ3JCLFdBQVc7SUFDSixFQUFFLENBQVc7SUFDcEIsWUFBWTtJQUNMLE9BQU8sQ0FBVztJQUN6QixhQUFhO0lBQ04sTUFBTSxDQUFXO0lBQ3hCLFdBQVc7SUFDSixPQUFPLENBQVc7SUFDekIsU0FBUztJQUNGLFlBQVksQ0FBTztJQUMxQixVQUFVO0lBQ0gsU0FBUyxDQUFVO0lBQzFCLFlBQVksQ0FBcUI7UUFDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakMsQ0FBQztJQUNMLENBQUM7SUFDTSxNQUFNLENBQUMsR0FBUTtRQUNsQixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUV0RCxDQUFDO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ00sTUFBTSxDQUFDLEdBQVE7UUFDbEIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7UUFFdEQsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBRUQsU0FBUztBQUNULE1BQU0sT0FBTztJQUNGLFNBQVMsQ0FBVTtJQUNuQixPQUFPLENBQVk7SUFDMUIsWUFBWSxJQUF1QjtRQUMvQixJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNoQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDekMsQ0FBQztDQUNKO0FBRUQsT0FBTyxFQUNILFFBQVEsRUFDUixPQUFPLEVBQ1YsQ0FBQyJ9