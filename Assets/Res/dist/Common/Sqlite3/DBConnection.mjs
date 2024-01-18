import { DBCommand } from "./DBCommand.mjs";
import { DBMapping } from "./DBMapping.mjs";
import { DBQuery } from "./DBQuery.mjs";
import { Orm } from "./Orm.mjs";
var SQLiteConnection = CS.SqlCipher4Unity3D.SQLiteConnection;
var SQLiteOpenFlags = CS.SqlCipher4Unity3D.SQLiteOpenFlags;
/**连接实例 */
export class DBConnection {
    //Getter 丶 Setter
    get handle() { return this._handle; }
    get datapath() { return this._datapath; }
    get opened() { return this._opened; }
    get trace() { return this._trace; }
    set trace(val) { this._trace = val; }
    //更新过的表
    get inMemory() { return this._inMemory; }
    get updateTables() { return this._updateTables; }
    constructor(path) {
        //已经连接数据库
        this._opened = false;
        //打印信息
        this._trace = false;
        //事务信息
        this._transactionDepth = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb25uZWN0aW9uLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb25uZWN0aW9uLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNoQyxJQUFPLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNoRSxJQUFPLGVBQWUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDO0FBSTlELFVBQVU7QUFDVixNQUFNLE9BQU8sWUFBWTtJQWNyQixpQkFBaUI7SUFDakIsSUFBVyxNQUFNLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFXLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQVcsTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDNUMsSUFBVyxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMxQyxJQUFXLEtBQUssQ0FBQyxHQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JELE9BQU87SUFDUCxJQUFXLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQVcsWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFJeEQsWUFBWSxJQUFZO1FBbEJ4QixTQUFTO1FBQ0QsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUNqQyxNQUFNO1FBQ0UsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUNoQyxNQUFNO1FBQ0Usc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBY2xDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFDTSxJQUFJLENBQUMsTUFBZ0I7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDekMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1Qsa0ZBQWtGO2dCQUNsRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hELHNCQUFzQjtnQkFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBRXBCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixpRkFBaUY7Z0JBQ2pGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3BELHNCQUFzQjtnQkFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ00sS0FBSztRQUNSLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDO2dCQUNELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsQ0FBQztvQkFDTyxDQUFDO2dCQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN4QixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFDTSxPQUFPO1FBQ1YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUMzQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDO0lBQ00sZUFBZSxDQUFDLFNBQWlCO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYTtZQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO1lBQzdELE9BQU87UUFDWCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00saUJBQWlCO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQ25DLENBQUM7SUFFRCxzQkFBc0I7SUFDZixXQUFXLENBQUMsSUFBa0I7UUFDakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLEtBQUssR0FBRywrQkFBK0IsT0FBTyxDQUFDLFNBQVMsT0FBTyxDQUFDO1FBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQztZQUMzQixLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUNELEtBQUssSUFBSSxHQUFHLENBQUM7UUFFYixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUNNLFNBQVMsQ0FBQyxJQUFrQjtRQUMvQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksS0FBSyxHQUFHLHlCQUF5QixPQUFPLENBQUMsU0FBUyxHQUFHLENBQUM7UUFFMUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDTSxVQUFVLENBQUMsSUFBa0I7UUFDaEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDO1FBRWpELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsWUFBWTtJQUVaLFlBQVk7SUFDTCxnQkFBZ0IsQ0FBQyxNQUFnQjtRQUNwQyxJQUFJLENBQUM7WUFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1AsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxDQUFDO1FBQ1osQ0FBQztJQUNMLENBQUM7SUFDTSxnQkFBZ0I7UUFDbkIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsdUZBQXVGLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBQ00sTUFBTTtRQUNULElBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQUNNLFFBQVEsQ0FBQyxTQUFrQjtRQUM5QixJQUFJLFNBQVM7WUFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzs7WUFFdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sT0FBTyxDQUFDLFNBQWlCO1FBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTyxTQUFTO1FBQ2IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckMsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDOUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDekMsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNPLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQVc7UUFDMUMsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDckQsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPO1lBQ1gsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHdHQUF3RyxDQUFDLENBQUM7SUFDOUgsQ0FBQztJQUNELFlBQVk7SUFFWixjQUFjO0lBQ1AsS0FBSyxDQUFtQixJQUFhO1FBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ00sR0FBRyxDQUFtQixJQUFhLEVBQUUsRUFBTztRQUMvQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUksSUFBSSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNoRCxDQUFDO0lBQ00sZUFBZSxDQUFDLElBQWtCO1FBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsT0FBTyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsWUFBWTtJQUdaLGNBQWM7SUFDUCxNQUFNLENBQUMsR0FBUTtRQUNsQixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNNLGVBQWUsQ0FBQyxHQUFRO1FBQzNCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBQ00sU0FBUyxDQUFDLElBQWdCO1FBQzdCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFDTyxVQUFVLENBQUMsSUFBZ0IsRUFBRSxLQUF3QixFQUFFLE9BQWtCO1FBQzdFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDO1FBRWIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDZixLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztnQkFBUyxDQUFDO1lBQ1AsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ08sT0FBTyxDQUFDLEdBQVEsRUFBRSxLQUF3QixFQUFFLE9BQWtCO1FBQ2xFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO1lBQ2hCLE9BQU8sQ0FBQyxDQUFDO1FBRWIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFeEMsSUFBSSxTQUFTLEdBQUcsS0FBSyxLQUFLLFlBQVksQ0FBQztRQUV2QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUM5RSxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssRUFBTyxDQUFDO1FBQzVCLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBDLElBQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsWUFBWTtJQUVMLGFBQWEsQ0FBQyxLQUFhLEVBQUUsR0FBRyxJQUFXO1FBQzlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsT0FBTyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUNNLFlBQVksQ0FBbUIsSUFBYSxFQUFFLEtBQWEsRUFBRSxHQUFHLElBQVc7UUFDOUUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDTSxVQUFVO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNNLGFBQWEsQ0FBQyxLQUFhLEVBQUUsR0FBRyxJQUFXO1FBQzlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDRCxTQUFTO0lBQ0QsVUFBVSxDQUFDLElBQWtCO1FBQ2pDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNYLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixXQUFXO1lBQ1gsS0FBSSx3QkFBeUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNELGFBQWE7SUFDTCxVQUFVLENBQUMsT0FBa0I7UUFDakMsT0FBTztRQUNQLElBQUksU0FBUyxHQUFHLCtCQUErQixHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBQzlFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQUUsU0FBUyxJQUFJLEtBQUssQ0FBQztZQUM5QixTQUFTLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELFNBQVMsSUFBSSxHQUFHLENBQUM7UUFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5Qix1QkFBdUI7UUFDdkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxRUFBcUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0gsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBUyxRQUFRLENBQUMsQ0FBQztRQUN4RCxVQUFVO1FBQ1YsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLElBQUksT0FBTyxHQUFrQixJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3pDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JELElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTztvQkFDeEQsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN2QixDQUFDOztnQkFDRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsS0FBSztRQUNMLElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixZQUFZO1lBQ1osSUFBSSxRQUFRLEdBQVcsRUFBRSxDQUFDO1lBQzFCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3pDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQzVDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDOzRCQUFFLFFBQVEsSUFBSSxHQUFHLENBQUM7d0JBQ3pDLFFBQVEsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7d0JBQzdDLE1BQU07b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUNELDBDQUEwQztZQUMxQywwQ0FBMEM7WUFDMUMsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ25DLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLFVBQVUsTUFBTSxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLFVBQVUseUJBQXlCLFVBQVUsTUFBTSxDQUFDLENBQUM7Z0JBQzFGLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLFVBQVUsTUFBTSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzlCLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixVQUFVLFFBQVEsUUFBUSxhQUFhLFFBQVEsV0FBVyxVQUFVLEtBQUssQ0FBQyxDQUFDO2dCQUNuSCxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixVQUFVLE1BQU0sQ0FBQyxDQUFBO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBRWhELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELE9BQU87YUFDRixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ25DLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLFVBQVUsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLFVBQVUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRSxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELHNCQUFzQjtJQUNkLFlBQVksQ0FBQyxHQUFXO1FBQzVCLElBQUksQ0FBQyxHQUFHO1lBQ0osTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUV6RSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2FBQ2xCLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFdkQsbUJBQW1CO1FBQ25CLElBQUksTUFBTSxHQUE2QyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ25FLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdCLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBQ0QsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7aUJBQ2xCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2lCQUNsQixPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztpQkFDbEIsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNSLElBQUk7Z0JBQ0osT0FBTyxFQUFFLEdBQUc7YUFDZixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksVUFBVSxDQUFDLFVBQWtCLEVBQUUsVUFBcUI7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLGdCQUFnQixFQUFFLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDL0MsSUFBSSxDQUFDO1lBQ0QsT0FBTztZQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLFVBQVUsU0FBUyxPQUFPLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLG1CQUFtQjtZQUNuQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixPQUFPLHNDQUFzQyxDQUFDLENBQUM7WUFDakcsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtvQkFDdkIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFLLGlCQUFpQjtvQkFFakYsSUFBSSxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO29CQUNqRCxLQUFLLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDMUIsSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDOzRCQUNoRixTQUFTO3dCQUNiLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixLQUFLLEtBQUssSUFBSSxzQkFBc0IsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUM7b0JBQ2pHLENBQUM7b0JBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO2dCQUFTLENBQUM7WUFDUCxPQUFPO1lBQ1AsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0wsQ0FBQztJQUNELG1CQUFtQjtJQUNaLFlBQVksQ0FBQyxVQUFrQixFQUFFLFVBQXFCO1FBQ3pELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixDQUFDO1FBQy9DLElBQUksQ0FBQztZQUNELE9BQU87WUFDUCxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixVQUFVLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUVyRSxtQkFBbUI7WUFDbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsT0FBTyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ2pHLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNULElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZCLElBQUksZUFBZSxHQUFHLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBWSxpQkFBaUI7b0JBRXhGLElBQUksQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsQ0FBQztvQkFDakQsS0FBSyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksTUFBTSxFQUFFLENBQUM7d0JBQzFCLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzs0QkFDaEYsU0FBUzt3QkFDYixJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQzt3QkFDaEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLLElBQUksc0JBQXNCLE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDO29CQUNqRyxDQUFDO29CQUNELElBQUksQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQztnQkFBUyxDQUFDO1lBQ1AsT0FBTztZQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVksRUFBRSxTQUFtQjtRQUN0RCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFLENBQUM7WUFDdkIsSUFBSSxNQUFNO2dCQUNOLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUYsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSiJ9