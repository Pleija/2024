var ModelBase = CS.SqlCipher4Unity3D.ModelBase;
var SQLiteConnection = CS.SqlCipher4Unity3D.SQLiteConnection;
export class Database {
    command;
    connection;
    trace = true;
    //private stmt: IntPtr;
    changes;
    results;
    get lastInsertRowId() {
        return this.lastID;
    }
    get rowCount() {
        return this.results.length;
    }
    get lastID() {
        return this.command.LastRowID;
    }
    verbose() {
        this.trace = true;
        return this;
    }
    constructor(dbFile, mode, cb) {
        //mode ??= SQLiteOpenFlags.Create | SQLiteOpenFlags.FullMutex | SQLiteOpenFlags.ReadWrite;
        this.connection = dbFile ? new SQLiteConnection(dbFile, typeof mode == "string" ? mode : null) : ModelBase.Connection;
        //this.command = new SQLiteCommand(this.connection);
        cb?.apply(this, [null]);
        if (this.trace)
            console.log("open database");
    }
    prepare(sql) {
        if (this.trace)
            console.log(`prepare ${JSON.stringify(arguments)}`);
        this.command = this.connection.CreateCommand(sql);
        // this.command.CommandText = sql;
        // //this.stmt = this.sqliteCommand.Prepare();
        // this.command.ClearBinds();
        return this;
    }
    serialize(fn) {
        if (this.trace)
            console.log(`serialize: ${JSON.stringify(arguments)}`);
        fn.apply(this, null);
        return this;
    }
    query(sql, args) {
        if (this.trace)
            console.log(`all ${JSON.stringify(arguments)}`);
        this.prepare(sql);
        args?.forEach(t => {
            if (typeof t == "boolean") {
                this.command.Bind(t ? 1 : 0);
            }
            else if (typeof t == "string") {
                this.command.Bind(t);
            }
            else if (typeof t == "number") {
                this.command.Bind(t);
            }
        });
        let results = [];
        const reader = this.command.ExecuteReader();
        while (reader.Read()) {
            let row = {};
            for (let i = 0; i < reader.colNames.Count; i++) {
            }
        }
        reader.Dispose();
        return {
            [Symbol.iterator]: function* () {
                let properties = Object.keys(this);
                for (let i of properties) {
                    yield [i, this[i]];
                }
            },
            columns() {
                return [];
            },
            next() {
                return { value: [] };
            }
        };
    }
    adapter(args) {
        let fn = [];
        //const fn = args.length > 0 && typeof args[args.length - 1] == "function" ? args.slice(-1)[0] : null;
        // if (fn != null) {
        //     args = args.slice(0, args.length - 1);
        // }
        if (this.command == null) {
            if (args.length > 0 && typeof args[0] == "string") {
                this.command = this.connection.CreateCommand(args.shift());
                //args = args.slice(1, args.length - 1);
            }
            else {
                throw new Error("sql is null");
            }
        }
        if (this.command != null) {
            if (args.length > 0) {
                if (typeof args[0] == "object") {
                    const bindObj = args.shift();
                    Object.keys(bindObj).forEach(k => this.command.Bind(k, bindObj[k]));
                }
                else {
                    args.forEach(v => {
                        if (typeof v == "function") {
                            fn.push(v);
                        }
                        else if (typeof v != "object") {
                            this.command.Bind(v);
                        }
                    });
                }
            }
        }
        else {
            throw new Error("SqlCommand is null");
        }
        return fn;
    }
    all(sql, args, e) {
        if (this.trace)
            console.log(`all ${JSON.stringify(arguments)}`);
        this.prepare(sql);
        //this.stmt = this.command.Prepare();
        return this;
    }
    each(...args) {
        const cb = this.adapter(args);
    }
    run(...args) {
        if (this.trace)
            console.log(`run arguments: ${JSON.stringify(arguments)}`);
        // if (typeof sql == "string") {
        //     this.prepare(sql);
        // }
        // const binds = Array.isArray(sql) || typeof sql == "object" ? sql : (Array.isArray(args) || typeof args == "object") ? args : null;
        //
        // if (Array.isArray(binds)) {
        //     binds.forEach(t => this.command.Bind(t));
        // } else if (typeof binds == "object") {
        //     Object.keys(binds).forEach(k => {
        //         this.command.Bind(k, binds[k]);
        //     });
        // }
        // else {
        //     if (typeof sql == "string") this.prepare(sql);
        //if (Array.isArray(args))
        //    (args as []).forEach(t => this.command.Bind(t));
        //}
        try {
            const cb = this.adapter(args);
            this.changes = this.command.ExecuteNonQuery();
            // this.lastID = 0;
            if (this.trace)
                console.log(`changes: ${this.changes}`);
            //if (typeof args == "function") args.apply(this, [null]);
            if (cb.length > 0)
                cb[0].apply(this, [null]);
        }
        finally {
            this.command = null;
        }
        return this;
    }
    finalize() {
        if (this.trace)
            console.log("finalize");
        this.command = null;
        //this.command.Finalize(this.stmt);
        return this;
    }
    close(cb) {
        if (this.trace)
            console.log("close");
        cb?.apply(this, [null]);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TcWxpdGUtdHMvZHJpdmVycy9EYXRhYmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBTyxTQUFTLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFPLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQztBQUdoRSxNQUFNLE9BQU8sUUFBUTtJQUNULE9BQU8sQ0FBZ0I7SUFDZCxVQUFVLENBQW1CO0lBQ3RDLEtBQUssR0FBWSxJQUFJLENBQUM7SUFDOUIsdUJBQXVCO0lBQ3ZCLE9BQU8sQ0FBUztJQUNoQixPQUFPLENBQVE7SUFFZixJQUFJLGVBQWU7UUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsWUFBWSxNQUFlLEVBQUUsSUFBK0IsRUFBRSxFQUEwQjtRQUNwRiwwRkFBMEY7UUFDMUYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztRQUN0SCxvREFBb0Q7UUFDcEQsRUFBRSxF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