import { ClassMetadata, FieldMetadata } from "./Utils/Decorator.mjs";
import { DBCommandInsert } from "./DBCommandInsert.mjs";
import { DBColumn } from "./DBColumn.mjs";
import { Table, Column, PrimaryKey, AutoInc, Unique, NotNull, DefaultValue, MaxLength } from "./Utils/Attributes.mjs";
/**数据表映射信息 */
class DBMapping {
    /**表对应的js原型 proto */
    Type;
    /**数据表名称 */
    tableName;
    /**主键 */
    pk;
    /**字段信息 */
    columns;
    /**通过主键查询 */
    getByPrimaryKeySql;
    //插入命令行
    _insertCommand;
    _insertCommandExtra;
    /**字段信息 */
    _insertColumns;
    _insertOrReplaceColumns;
    get insertColumns() {
        if (!this._insertColumns) {
            this._insertColumns = new Array();
            this.columns.forEach(col => {
                if (!col.autoInc)
                    this._insertColumns.push(col);
            });
        }
        return this._insertColumns;
    }
    get insertOrReplaceColumns() {
        if (!this._insertOrReplaceColumns) {
            this._insertOrReplaceColumns = new Array();
            this.columns.forEach(col => this._insertOrReplaceColumns.push(col));
        }
        return this._insertOrReplaceColumns;
    }
    constructor(type) {
        this.Type = type;
        //数据表名称
        let name = ClassMetadata.getFirst(type, Table)?.info ?? type.name;
        this.tableName = name;
        //获取字段信息
        this.columns = new Array();
        for (let key of FieldMetadata.getFields(type, true)) {
            let conf = FieldMetadata.getFirst(type, key, Column, true)?.info;
            if (!conf)
                continue;
            let pk = !!FieldMetadata.getFirst(type, key, PrimaryKey, true);
            let autoInc = pk && !!FieldMetadata.getFirst(type, key, AutoInc, true);
            let unique = !!FieldMetadata.getFirst(type, key, Unique, true);
            let notNull = !!FieldMetadata.getFirst(type, key, NotNull, true);
            let value = FieldMetadata.getFirst(type, key, DefaultValue, true)?.info;
            let len = FieldMetadata.getFirst(type, key, MaxLength, true)?.info;
            let col = new DBColumn({
                prop: key,
                propType: conf.type,
                name: conf.alias ?? key,
                pk: pk,
                autoInc: autoInc,
                unique: unique,
                notNull: notNull,
                defaultValue: value,
                maxLength: len,
            });
            this.columns.push(col);
            if (col.pk)
                this.pk = col;
        }
        if (this.columns.length <= 0)
            throw new Error(`数据表${type.name}(${this.tableName}), 没有有效字段`);
        let info = "";
        this.columns.forEach(col => info += "\n" + JSON.stringify(col));
        //console.log(`DBMapping: ${this.tableName}:${info}`);
        //PK
        if (this.pk)
            this.getByPrimaryKeySql = `SELECT * FROM "${this.tableName}" WHERE "${this.pk.name}" = ?`;
        else
            this.getByPrimaryKeySql = `SELECT * FROM "${this.tableName}" LIMIT 1`;
    }
    findColumn(name) {
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].name == name)
                return this.columns[i];
        }
        return null;
    }
    findColumnByPorpertyName(name) {
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].prop == name)
                return this.columns[i];
        }
        return null;
    }
    dispose() {
        if (this._insertCommand)
            this._insertCommand.dispose();
    }
    getInsertCommand(conn, extra) {
        if (!this._insertCommand) {
            this._insertCommand = this.createInsertCommand(conn, extra);
            this._insertCommandExtra = extra;
        }
        else if (!this._insertCommand.isConnect(conn) || this._insertCommandExtra != extra) {
            this._insertCommand.dispose();
            this._insertCommand = this.createInsertCommand(conn, extra);
            this._insertCommandExtra = extra;
        }
        return this._insertCommand;
    }
    createInsertCommand(conn, extra) {
        let insertSql = "";
        let cols = this.insertColumns;
        if (cols.length == 1 && cols[0].autoInc) {
            insertSql = `INSERT ${this.tableName} INTO "${extra}" DEFAULT VALUES`;
        }
        else {
            if (extra === "OR REPLACE")
                cols = this.insertOrReplaceColumns;
            let names = new Array(), vals = new Array();
            for (let col of cols) {
                names.push("\"" + col.name + "\"");
                vals.push("?");
            }
            insertSql = `INSERT ${extra} INTO "${this.tableName}"(${names.join(",")}) VALUES (${vals.join(",")})`;
        }
        let cmd = new DBCommandInsert(conn);
        cmd.commandText = insertSql;
        return cmd;
    }
    createInstance() {
        return new (this.Type)();
    }
}
export { DBMapping };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJNYXBwaW5nLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJNYXBwaW5nLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxFQUNILEtBQUssRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLE9BQU8sRUFDUCxNQUFNLEVBQ04sT0FBTyxFQUNQLFlBQVksRUFDWixTQUFTLEVBQ1osTUFBTSx3QkFBd0IsQ0FBQztBQUtoQyxhQUFhO0FBQ2IsTUFBTSxTQUFTO0lBQ1gsb0JBQW9CO0lBQ2IsSUFBSSxDQUFlO0lBQzFCLFdBQVc7SUFDSixTQUFTLENBQVM7SUFDekIsUUFBUTtJQUNELEVBQUUsQ0FBVztJQUNwQixVQUFVO0lBQ0gsT0FBTyxDQUFhO0lBQzNCLFlBQVk7SUFDTCxrQkFBa0IsQ0FBUztJQUNsQyxPQUFPO0lBQ0MsY0FBYyxDQUFrQjtJQUNoQyxtQkFBbUIsQ0FBUztJQUNwQyxVQUFVO0lBQ0YsY0FBYyxDQUFhO0lBQzNCLHVCQUF1QixDQUFhO0lBQzVDLElBQVcsYUFBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTztvQkFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMs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