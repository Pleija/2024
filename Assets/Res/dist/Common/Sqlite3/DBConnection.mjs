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
        let query = `CREATE TABLE IF NOT EXISTS "${mapping.tableName}"(\n)`;
        for (let i = 0; i < mapping.columns.length; i++) {
            if (i >= 0)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb25uZWN0aW9uLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb25uZWN0aW9uLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNoQyxJQUFPLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNoRSxJQUFPLGVBQWUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDO0FBSTlELFVBQVU7QUFDVixNQUFNLE9BQU8sWUFBWTtJQUNyQixTQUFTO0lBQ0QsU0FBUyxDQUFtQztJQUM1QyxXQUFXLENBQWlCO0lBQ3BDLE1BQU07SUFDRSxPQUFPLENBQW1CO0lBQ2xDLE1BQU07SUFDRSxTQUFTLENBQVM7SUFDMUIsU0FBUztJQUNELE9BQU8sR0FBWSxLQUFLLENBQUM7SUFDakMsTUFBTTtJQUNFLE1BQU0sR0FBWSxLQUFLLENBQUM7SUFDaEMsTUFBTTtJQUNFLGlCQUFpQixHQUFXLENBQUMsQ0FBQztJQUN0QyxpQkFBaUI7SUFDakIsSUFBVyxNQUFNLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFXLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQVcsTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDNUMsSUFBVyxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFD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