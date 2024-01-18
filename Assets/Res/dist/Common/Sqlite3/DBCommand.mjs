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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb21tYW5kLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO0FBRzFELDJCQUEyQjtBQUMzQixNQUFNLFVBQVUsU0FBUyxDQUFDLE1BQW9CLEVBQUUsS0FBc0IsRUFBRSxJQUFZO0lBQ2hGLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsT0FBTyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUN0QixPQUFPLFNBQVMsQ0FBQztJQUNyQixRQUFRLElBQUksRUFBRSxDQUFDO1FBQ1gsS0FBSyxRQUFRO1lBQ1QsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLEtBQUssUUFBUTtZQUNULE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxLQUFLLFNBQVM7WUFDVixnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvQyxLQUFLLFFBQVE7WUFDVCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsS0FBSyxTQUFTO1lBQ1YsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxLQUFLLFVBQVU7WUFDWCxDQUFDO2dCQUNH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