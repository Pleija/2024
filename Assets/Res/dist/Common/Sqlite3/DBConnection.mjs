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