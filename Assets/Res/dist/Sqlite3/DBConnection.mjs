import { DBCommand } from "./DBCommand.mjs";
import { DBMapping } from "./DBMapping.mjs";
import { DBQuery } from "./DBQuery.mjs";
import { Orm } from "./Orm.mjs";
var SQLiteConnection = CS.SqlCipher4Unity3D.SQLiteConnection;
var SQLiteOpenFlags = CS.SqlCipher4Unity3D.SQLiteOpenFlags;
/**连接实例 */
export class DBConnection {
    //Mapping
    _mappings;
    _mappingSet;
    //连接实例
    _handle;
    //连接信息
    _datapath;
    //已经连接数据库
    _opened = false;
    //打印信息
    _trace = false;
    //事务信息
    _transactionDepth = 0;
    //Getter 丶 Setter
    get handle() { return this._handle; }
    get datapath() { return this._datapath; }
    get opened() { return this._opened; }
    get trace() { return this._trace; }
    set trace(val) { this._trace = val; }
    //更新过的表
    get inMemory() { return this._inMemory; }
    get updateTables() { return this._updateTables; }
    _updateTables;
    _inMemory;
    constructor(path) {
        if (!CS.System.IO.File.Exists(path))
            throw new Error("FileNotFoundException: " + path);
        this._opened = false;
        this._datapath = path;
    }
    open(memory) {
        if (!this._opened || !this._handle) {
            if (!CS.System.IO.File.Exists(this._datapath))
                throw new Error("FileNotFoundException: " + this._datapath);
            this._inMemory = !!memory;
            if (memory) {
                //this._handle = new CS.SQLite.SQLiteConnection("DATA SOURCE=:memory:;Version=3");
                this._handle = new SQLiteConnection(":memory:");
                //this._handle.Open();
                this._opened = true;
                this.copyToSelf(this._datapath);
            }
            else {
                //this._handle = new CS.SQLite.SQLiteConnection("DATA SOURCE=" + this._datapath);
                this._handle = new SQLiteConnection(this._datapath);
                //this._handle.Open();
                this._opened = true;
            }
        }
    }
    close() {
        if (this._opened && this._handle) {
            try {
                this._handle.Close();
                this._handle.Dispose();
            }
            finally {
                this._opened = false;
                this._handle = null;
            }
        }
    }
    dispose() {
        let set = this._mappingSet;
        if (set) {
            set.forEach(mapping => mapping.dispose());
        }
        this.close();
        this._mappings = null;
        this._mappingSet = null;
    }
    markUpdateTable(tableName) {
        if (!this._updateTables)
            this._updateTables = [];
        if (this._updateTables.indexOf(tableName) >= 0 || !this._inMemory)
            return;
        this._updateTables.push(tableName);
    }
    clearUpdateTables() {
        this._updateTables = undefined;
    }
    //#region  创建表丶删除表丶清空表
    createTable(type) {
        let mapping = this.getMapping(type);
        let query = `CREATE TABLE IF NOT EXISTS "${mapping.tableName}"(\n`;
        for (let i = 0; i < mapping.columns.length; i++) {
            if (i > 0)
                query += ",\n";
            query += Orm.sqlDecl(mapping.columns[i]);
        }
        query += ")";
        this.markUpdateTable(mapping.tableName);
        return this.executeUpdate(query);
    }
    dropTable(type) {
        let mapping = this.getMapping(type);
        let query = `DROP TABLE IF EXISTS "${mapping.tableName}"`;
        this.markUpdateTable(mapping.tableName);
        return this.executeUpdate(query);
    }
    clearTable(type) {
        let mapping = this.getMapping(type);
        let query = `DELETE FROM "${mapping.tableName}"`;
        this.markUpdateTable(mapping.tableName);
        return this.executeUpdate(query);
    }
    //#endregion
    //#region 事务
    runInTransaction(action) {
        try {
            let point = this.savePoint();
            action();
            this.release(point);
        }
        catch (e) {
            this.rollback();
            throw e;
        }
    }
    beginTransaction() {
        if (this._transactionDepth == 0) {
            this._transactionDepth = 1;
            this.executeUpdate("BEGIN TRANSACTION");
        }
        throw new Error("InvalidOperationException: Cannot begin a transaction while already in a transaction.");
    }
    commit() {
        if (this._transactionDepth > 0) {
            this._transactionDepth = 0;
            this.executeUpdate("COMMIT");
        }
    }
    rollback(savepoint) {
        if (savepoint)
            this.doPoint(savepoint, "ROLLBACK TO");
        else
            this.executeUpdate("ROLLBACK");
    }
    release(savepoint) {
        this.doPoint(savepoint, "RELEASE");
    }
    savePoint() {
        let depth = this._transactionDepth++;
        let point = "S" + parseInt((Math.random() * 100000).toString()) + "D" + depth;
        this.executeUpdate("SAVEPOINT " + point);
        return point;
    }
    doPoint(savepoint, cmd) {
        let first_len = savepoint.indexOf("D");
        if (first_len >= 2 && savepoint.length > first_len + 1) {
            let depth = parseInt(savepoint.substring(first_len + 1));
            if (depth >= 0 && depth < this._transactionDepth) {
                this._transactionDepth = depth;
                this.executeUpdate(cmd.trim() + " " + savepoint);
                return;
            }
        }
        throw new Error("ArgumentException: savePoint is not valid, and should be the result of a call to SaveTransactionPoint.");
    }
    //#endregion
    //#region 查询记录
    table(type) {
        return new DBQuery(this, this.getMapping(type));
    }
    get(type, pk) {
        let mapping = this.getMapping(type);
        let result = this.executeQuery(type, mapping.getByPrimaryKeySql, pk);
        return result.length > 0 ? result[0] : null;
    }
    lastInsertRowid(type) {
        var cmd = this.createCommand("");
        return cmd.lastInserRowid(this.getMapping(type));
    }
    //#endregion
    //#region 插入记录
    insert(obj) {
        let proto = Object.getPrototypeOf(obj);
        return this._insert(obj, "", this.getMapping(proto.constructor));
    }
    insertOrReplace(obj) {
        let proto = Object.getPrototypeOf(obj);
        return this._insert(obj, "OR REPLACE", this.getMapping(proto.constructor));
    }
    insertAll(objs) {
        if (!objs || objs.length == 0)
            return 0;
        let proto = Object.getPrototypeOf(objs[0]);
        return this._insertAll(objs, "", this.getMapping(proto.constructor));
    }
    _insertAll(objs, extra, mapping) {
        if (!objs || !mapping)
            return 0;
        let count = 0;
        try {
            this.runInTransaction(() => {
                objs.forEach(obj => {
                    count += this._insert(obj, extra, mapping);
                });
            });
        }
        finally {
            mapping.dispose();
        }
        return count;
    }
    _insert(obj, extra, mapping) {
        if (!obj || !mapping)
            return 0;
        this.markUpdateTable(mapping.tableName);
        let replacing = extra === "OR REPLACE";
        let cols = replacing ? mapping.insertOrReplaceColumns : mapping.insertColumns;
        let vals = new Array();
        for (let col of cols) {
            vals.push(col.encode(obj[col.prop]));
        }
        let cmd = mapping.getInsertCommand(this, extra ?? "");
        let count = cmd.executeUpdate(vals);
        if (mapping.pk && mapping.pk.autoInc) {
            obj[mapping.pk.prop] = this.lastInsertRowid(mapping.Type);
        }
        return count;
    }
    //#endregion
    executeUpdate(query, ...args) {
        let command = this.createCommand(query, ...args);
        return command.executeUpdate();
    }
    executeQuery(type, query, ...args) {
        let command = this.createCommand(query, ...args);
        return command.executeQuery(this.getMapping(type));
    }
    newCommand() {
        if (!this._opened)
            throw new Error("Cannot create commands from unopened database");
        return new DBCommand(this);
    }
    createCommand(query, ...args) {
        var command = this.newCommand();
        command.commandText = query;
        args.forEach(val => command.bind(val));
        return command;
    }
    //Mapping
    getMapping(type) {
        if (typeof (type) !== "function")
            throw new Error("ctor is not constructor:" + type);
        if (!this._mappings) {
            this._mappings = new WeakMap();
            this._mappingSet = new Set();
        }
        let mapping = this._mappings.get(type);
        if (!mapping) {
            mapping = new DBMapping(type);
            //校验当前数据库信息
            if ( /**!mapping.fixed &&  */this.proofTable(mapping)) {
                this._mappings.set(type, mapping);
                this._mappingSet.add(mapping);
            }
        }
        return mapping;
    }
    /**校验当前数据表 */
    proofTable(mapping) {
        //尝试创建表
        let createSql = "CREATE TABLE IF NOT EXISTS \"" + mapping.tableName + "\"(\n";
        for (let i = 0; i < mapping.columns.length; i++) {
            if (i > 0)
                createSql += ",\n";
            createSql += Orm.sqlDecl(mapping.columns[i]);
        }
        createSql += ")";
        this.executeUpdate(createSql);
        //从数据库拉取表信息<与当前表比对字段信息>
        let command = this.createCommand("SELECT sql FROM sqlite_master WHERE type = \"table\" AND name = ? ;", mapping.tableName);
        let existsSql = command.executeScalar("string");
        //比对表的差异性
        let createCols = this.proofColumns(createSql);
        let existsCols = this.proofColumns(existsSql);
        let addCols = new Array();
        let rebuild = createCols.length < existsCols.length;
        for (let i = 0; i < createCols.length && !rebuild; i++) {
            let col1 = createCols[i];
            if (i < existsCols.length) {
                let col2 = existsCols[i];
                if (col1.name !== col2.name || col1.content !== col2.content)
                    rebuild = true;
            }
            else
                addCols.push(col1.content);
        }
        //重构表
        if (rebuild) {
            //寻找相同字段<继承>
            let samecols = "";
            for (let i = 0; i < createCols.length; i++) {
                for (let j = 0; j < existsCols.length; j++) {
                    if (createCols[i].name === existsCols[j].name) {
                        if (samecols.length > 0)
                            samecols += ",";
                        samecols += "\"" + createCols[i].name + "\"";
                        break;
                    }
                }
            }
            //console.log(JSON.stringify(createCols));
            //console.log(JSON.stringify(existsCols));
            //创建临时表->迁移相同字段数据->删除临时表
            this.runInTransaction(() => {
                let table_name = mapping.tableName;
                let table_temp = mapping.tableName + "_temp";
                this.executeUpdate(`PRAGMA foreign_keys = off;`);
                this.executeUpdate(`DROP TABLE IF EXISTS \"${table_temp}\" ;`);
                this.executeUpdate(`CREATE TABLE \"${table_temp}\" AS SELECT * FROM \"${table_name}\" ;`);
                this.executeUpdate(`DROP TABLE \"${table_name}\" ;`);
                this.executeUpdate(createSql);
                if (samecols.length > 0)
                    this.executeUpdate(`INSERT INTO \"${table_name}\" ( ${samecols} ) SELECT ${samecols} FROM \"${table_temp}\";`);
                this.executeUpdate(`DROP TABLE \"${table_temp}\" ;`);
                this.executeUpdate(`PRAGMA foreign_keys = on;`);
                console.warn(`column exception, rebuild sql: ${table_name}\n${createSql}`);
            });
            this.markUpdateTable(mapping.tableName);
        }
        //表追加字段
        else if (addCols && addCols.length > 0) {
            this.runInTransaction(() => {
                let table_name = mapping.tableName;
                for (var col of addCols) {
                    this.executeUpdate(`ALTER TABLE \"${table_name}\" ADD COLUMN ${col} ;`);
                    console.warn(`Alter table add column ${table_name}:${col}`);
                }
            });
            this.markUpdateTable(mapping.tableName);
        }
        return true;
    }
    /**从sql dll语句解析字段信息 */
    proofColumns(sql) {
        if (!sql)
            throw new Error("Can't create a TableMapping instance, sql: " + sql);
        sql = sql.replace(/\n/g, "")
            .replace(/\r/g, "")
            .substring(sql.indexOf("(") + 1, sql.indexOf(")"));
        //console.log(sql);
        let fields = new Array();
        for (let col of sql.split(",")) {
            col = col.trim();
            if (col.startsWith("\"")) {
                let index = col.indexOf("\" ");
                col = col.substring(1, index) + col.substring(index + 1);
            }
            let name = col.substring(0, col.indexOf(" "))
                .replace(/\t/g, "")
                .replace(/\r/g, "")
                .replace(/\n/g, "")
                .replace(/\"/g, "");
            fields.push({
                name,
                content: col
            });
        }
        return fields;
    }
    /**复制目标数据库到当前数据库
     * @param sourcePath 目标路径
     */
    copyToSelf(sourcePath, tableNames) {
        if (!this._inMemory && sourcePath === this.datapath) {
            throw new Error("same source file");
        }
        let FROM_DB = "TEMP_DB_ATTACH", TO_DB = "main";
        try {
            //附加数据库
            this.executeUpdate(`ATTACH DATABASE "${sourcePath}" as "${FROM_DB}";`);
            //查询表列表, 然后复制到当前数据库
            let command = this.createCommand(`SELECT * FROM ${FROM_DB}.sqlite_master WHERE type = "table";`);
            let master = command.executeQueryFileds("name");
            if (master) {
                this.runInTransaction(() => {
                    let retentionTables = ["sqlite_master", "sqlite_sequence"]; //系统保留表, 不应修改此表内容
                    this.executeUpdate(`PRAGMA foreign_keys = off;`);
                    for (let { name } of master) {
                        if (retentionTables.indexOf(name) >= 0 || tableNames && tableNames.indexOf(name) < 0)
                            continue;
                        this.executeUpdate(`DROP TABLE IF EXISTS ${TO_DB}."${name}" ;`);
                        this.executeUpdate(`CREATE TABLE ${TO_DB}."${name}" AS SELECT * FROM ${FROM_DB}."${name}";`);
                    }
                    this.executeUpdate(`PRAGMA foreign_keys = on;`);
                });
            }
        }
        finally {
            //分离数据库
            this.executeUpdate(`DETACH DATABASE "${FROM_DB}";`);
        }
    }
    /**复制当前数据库到目标数据库 */
    copyToTarget(sourcePath, tableNames) {
        if (!this._inMemory && sourcePath === this.datapath) {
            throw new Error("same source file");
        }
        let FROM_DB = "main", TO_DB = "TEMP_DB_ATTACH";
        try {
            //附加数据库
            this.executeUpdate(`ATTACH DATABASE "${sourcePath}" as "${TO_DB}";`);
            //查询表列表, 然后复制到当前数据库
            let command = this.createCommand(`SELECT * FROM ${FROM_DB}.sqlite_master WHERE type = "table";`);
            let master = command.executeQueryFileds("name");
            if (master) {
                this.runInTransaction(() => {
                    let retentionTables = ["sqlite_master", "sqlite_sequence"]; //系统保留表, 不应修改此表内容
                    this.executeUpdate(`PRAGMA foreign_keys = off;`);
                    for (let { name } of master) {
                        if (retentionTables.indexOf(name) >= 0 || tableNames && tableNames.indexOf(name) < 0)
                            continue;
                        this.executeUpdate(`DROP TABLE IF EXISTS ${TO_DB}."${name}" ;`);
                        this.executeUpdate(`CREATE TABLE ${TO_DB}."${name}" AS SELECT * FROM ${FROM_DB}."${name}";`);
                    }
                    this.executeUpdate(`PRAGMA foreign_keys = on;`);
                });
            }
        }
        finally {
            //分离数据库
            this.executeUpdate(`DETACH DATABASE "${TO_DB}";`);
        }
    }
    static createFile(path, delExists) {
        let exists = CS.System.IO.File.Exists(path);
        if (!exists || delExists) {
            if (exists)
                CS.System.IO.File.Delete(path);
            let handle = new SQLiteConnection(path, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create);
            handle.Close();
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb25uZWN0aW9uLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlMy9EQkNvbm5lY3Rpb24ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2hDLElBQU8sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDO0FBQ2hFLElBQU8sZUFBZSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUM7QUFJOUQsVUFBVTtBQUNWLE1BQU0sT0FBTyxZQUFZO0lBQ3JCLFNBQVM7SUFDRCxTQUFTLENBQW1DO0lBQzVDLFdBQVcsQ0FBaUI7SUFDcEMsTUFBTTtJQUNFLE9BQU8sQ0FBbUI7SUFDbEMsTUFBTTtJQUNFLFNBQVMsQ0FBUztJQUMxQixTQUFTO0lBQ0QsT0FBTyxHQUFZLEtBQUssQ0FBQztJQUNqQyxNQUFNO0lBQ0UsTUFBTSxHQUFZLEtBQUssQ0FBQztJQUNoQyxNQUFNO0lBQ0UsaUJBQWlCLEdBQVcsQ0FBQyxDQUFDO0lBQ3RDLGlCQUFpQjtJQUNqQixJQUFXLE1BQU0sS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQVcsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsSUFBVyxNQUFNLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFXLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFD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