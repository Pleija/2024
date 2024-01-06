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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJNYXBwaW5nLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJNYXBwaW5nLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxFQUNILEtBQUssRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLE9BQU8sRUFDUCxNQUFNLEVBQ04sT0FBTyxFQUNQLFlBQVksRUFDWixTQUFTLEVBQ1osTUFBTSx3QkFBd0IsQ0FBQztBQUtoQyxhQUFhO0FBQ2IsTUFBTSxTQUFTO0lBQ1gsb0JBQW9CO0lBQ2IsSUFBSSxDQUFlO0lBQzFCLFdBQVc7SUFDSixTQUFTLENBQVM7SUFDekIsUUFBUTtJQUNELEVBQUUsQ0FBVztJQUNwQixVQUFVO0lBQ0gsT0FBTyxDQUFhO0lBQzNCLFlBQVk7SUFDTCxrQkFBa0IsQ0FBUztJQUNsQyxPQUFPO0lBQ0MsY0FBYyxDQUFrQjtJQUNoQyxtQkFBbUIsQ0FBUztJQUNwQyxVQUFVO0lBQ0YsY0FBYyxDQUFhO0lBQzNCLHVCQUF1QixDQUFhO0lBQzVDLElBQVcsYUFBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPO29CQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELENBQUMs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