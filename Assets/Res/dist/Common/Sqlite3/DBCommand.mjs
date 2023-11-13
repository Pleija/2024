var SQLiteCommand = CS.SqlCipher4Unity3D.SQLiteCommand;
/**读取SqliteDataReader中的值 */
export function readValue(reader, index, type) {
    if (typeof index === "string") {
        index = reader.GetOrdinal(index);
        return readValue(reader, index, type);
    }
    if (reader.IsDBNull(index))
        return undefined;
    switch (type) {
        case "string":
            return reader.GetString(index);
        case "number":
            return reader.GetDouble(index);
        case "integer":
            //return reader.GetInt32(index);
            return Math.floor(reader.GetDouble(index));
        case "bigint":
            return reader.GetInt64(index);
        case "boolean":
            return reader.GetInt32(index) != 0;
        case "number[]":
            {
                let content = reader.GetString(index) ?? "";
                return content.split("|").filter(o => o.length > 0).map(o => parseFloat(o));
            }
        case "string[]":
            {
                let content = reader.GetString(index) ?? "";
                return content.split("|").map(o => o.replace(/&brvbar;/g, "|"));
            }
        case "object":
            {
                //对Object类型从Json反序列化
                let content = reader.GetString(index);
                return content ? JSON.parse(content) : undefined;
            }
    }
    throw new Error("NotSupportedException: Cannot store type " + type);
}
/**绑定SqliteCommand参数 */
export function bindParameter(command, value) {
    if (value === undefined || value === null || value === void 0) {
        command.Bind("");
        return;
    }
    switch (typeof (value)) {
        case "string":
        case "number":
        case "bigint":
            command.Bind(value);
            return;
        case "boolean":
            command.Bind(value ? 1 : 0);
            return;
        //对Object类型进行Json序列化
        case "object":
            let content = "";
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    if (typeof (value[0]) === "string") {
                        content = value.map(o => o.replace(/\|/g, "&brvbar;")).join("|");
                    }
                    else {
                        content = value.join("|");
                    }
                }
            }
            else {
                content = JSON.stringify(value);
            }
            command.Bind(content);
            return;
    }
    throw new Error("NotSupportedException: Cannot store type " + typeof (value));
}
function getDefaultValue(val) {
    switch (typeof (val)) {
        case "object":
            let ret = Array.isArray(val) ? [] : Object.create(Object.getPrototypeOf(val));
            Object.assign(ret, val);
            Object.setPrototypeOf(ret, Object.getPrototypeOf(val));
            return ret;
        case "function":
            return val();
        default:
            return val;
    }
}
export class DBCommand {
    commandText;
    _conn;
    _bindings;
    constructor(conn) {
        this._conn = conn;
        this.commandText = "";
        this._bindings = new Array();
    }
    executeUpdate() {
        if (this._conn.trace)
            console.log(this);
        let command = this.prepare();
        try {
            return command.ExecuteNonQuery();
        }
        finally {
            this.finally(command);
        }
    }
    executeQuery(map) {
        if (this._conn.trace)
            console.log(this);
        let command = this.prepare();
        let reader;
        try {
            let columns = map.columns;
            let result = new Array();
            //Execute Query
            reader = command.ExecuteReader();
            while (reader.Read()) {
                let obj = map.createInstance();
                for (let i = 0; i < columns.length; i++) {
                    let col = columns[i];
                    let val = readValue(reader, col.name, col.propType) ?? getDefaultValue(col.defaultValue);
                    if (val !== undefined && val !== null && val !== void 0)
                        obj[col.prop] = val;
                }
                result.push(obj);
            }
            return result;
        }
        finally {
            this.finally(command, reader);
        }
    }
    executeQueryFileds(...columns) {
        if (this._conn.trace)
            console.log(this);
        let command = this.prepare();
        let reader;
        try {
            let result = new Array();
            //Execute Query
            reader = command.ExecuteReader();
            while (reader.Read()) {
                let obj = Object.create(null);
                for (let i = 0; i < columns.length; i++) {
                    obj[columns[i]] = readValue(reader, columns[i], "string");
                }
                result.push(obj);
            }
            return result;
        }
        finally {
            this.finally(command, reader);
        }
    }
    executeScalar(type) {
        if (this._conn.trace)
            console.log(this);
        let command = this.prepare();
        let reader;
        try {
            reader = command.ExecuteReader();
            while (reader.Read()) {
                return readValue(reader, 0, type ?? "string");
            }
        }
        finally {
            this.finally(command, reader);
        }
        return null;
    }
    lastInserRowid(map) {
        let query = "SELECT last_insert_rowid() FROM \"" + map.tableName + "\";";
        if (this._conn.trace)
            console.log(query);
        let command = new SQLiteCommand(this._conn.handle);
        command.CommandText = query;
        //command.Prepare();
        let reader;
        try {
            reader = command.ExecuteReader();
            while (reader.Read()) {
                return readValue(reader, 0, map.pk.propType);
            }
        }
        finally {
            this.finally(command, reader);
        }
        return -1;
    }
    bind(val) {
        this._bindings.push(val);
    }
    bindAll(command) {
        for (let val of this._bindings) {
            bindParameter(command, val);
        }
    }
    prepare() {
        let command = new SQLiteCommand(this._conn.handle);
        command.CommandText = this.commandText;
        //command.Prepare();
        this.bindAll(command);
        return command;
    }
    finally(command, reader) {
        //command.Cancel();
        //command.Dispose();
        reader?.Close();
        reader?.Dispose();
    }
    toString() {
        return this.commandText + "\nargs:" + this._bindings.map(o => typeof o === "object" ? JSON.stringify(o) : o);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb21tYW5kLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO0FBRzFELDJCQUEyQjtBQUMzQixNQUFNLFVBQVUsU0FBUyxDQUFDLE1BQW9CLEVBQUUsS0FBc0IsRUFBRSxJQUFZO0lBQ2hGLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDekM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3RCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxRQUFRO1lBQ1QsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLEtBQUssUUFBUTtZQUNULE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxLQUFLLFNBQVM7WUFDVixnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvQyxLQUFLLFFBQVE7WUFDVCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsS0FBSyxTQUFTO1lBQ1YsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxLQUFLLFVBQVU7WUFDWDtnQkFDSSxJQUFJLE9BQU8sR0FBRyxNQUFN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