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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlMy9EQkNvbW1hbmQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLElBQU8sYUFBYSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUM7QUFHMUQsMkJBQTJCO0FBQzNCLE1BQU0sVUFBVSxTQUFTLENBQUMsTUFBb0IsRUFBRSxLQUFzQixFQUFFLElBQVk7SUFDaEYsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM1QixLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxPQUFPLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3RCLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDWCxLQUFLLFFBQVE7WUFDVCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsS0FBSyxRQUFRO1lBQ1QsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLEtBQUssU0FBUztZQUNWLGdDQUFnQztZQUNoQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9DLEtBQUssUUFBUTtZQUNULE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxLQUFLLFNBQVM7WUFDVixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssVUFBVTtZQUNYLENBQUM7Z0JBQ0csSUFBSSxPQUFP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