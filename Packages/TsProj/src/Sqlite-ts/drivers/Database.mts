import SQLiteCommand = CS.SqlCipher4Unity3D.SQLiteCommand;
import ModelBase = CS.SqlCipher4Unity3D.ModelBase;
import SQLiteConnection = CS.SqlCipher4Unity3D.SQLiteConnection;
import SQLiteOpenFlags = CS.SqlCipher4Unity3D.SQLiteOpenFlags;

export class Database {
    private command: SQLiteCommand;
    private readonly connection: SQLiteConnection;
    private trace: boolean = true;
    //private stmt: IntPtr;
    changes: number;
    results: any[];
    
    get lastInsertRowId(): number {
        return this.lastID;
    }
    
    get rowCount(): number {
        return this.results.length;
    }
    
    get lastID(): number {
        return this.command.LastRowID;
    }
    
    verbose() {
        this.trace = true;
        return this;
    }
    
    constructor(dbFile?: string, mode?: SQLiteOpenFlags | string, cb?: (err: string) => void) {
        //mode ??= SQLiteOpenFlags.Create | SQLiteOpenFlags.FullMutex | SQLiteOpenFlags.ReadWrite;
        this.connection = dbFile ? new SQLiteConnection(dbFile, typeof mode == "string" ? mode : null) : ModelBase.Connection;
        //this.command = new SQLiteCommand(this.connection);
        cb?.apply(this, [null]);
        if (this.trace) console.log("open database");
    }
    
    prepare(sql: string): Database {
        if (this.trace) console.log(`prepare ${JSON.stringify(arguments)}`);
        this.command = this.connection.CreateCommand(sql);
        // this.command.CommandText = sql;
        // //this.stmt = this.sqliteCommand.Prepare();
        // this.command.ClearBinds();
        return this;
    }
    
    serialize(fn: () => any): Database {
        if (this.trace) console.log(`serialize: ${JSON.stringify(arguments)}`)
        fn.apply(this, null);
        return this;
    }
    
    query(sql: string, args?: any[]): {
        columns(): Array<{ name: string, value: any }>,
        next(): { value: any[] },
        [Symbol.iterator]: any
    } {
        if (this.trace) console.log(`all ${JSON.stringify(arguments)}`);
        this.prepare(sql);
        args?.forEach(t => {
            if (typeof t == "boolean") {
                this.command.Bind(t ? 1 : 0);
            } else if (typeof t == "string") {
                this.command.Bind(t);
            } else if (typeof t == "number") {
                this.command.Bind(t);
            }
        });
        let results = [];
        const reader = this.command.ExecuteReader();
        while (reader.Read()) {
            let row: { [key: string]: any } = {};
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
                return {value: []};
            }
        };
    }
    
    adapter(args: any[]): Function[] {
        let fn: Function[] = [];
        //const fn = args.length > 0 && typeof args[args.length - 1] == "function" ? args.slice(-1)[0] : null;
        // if (fn != null) {
        //     args = args.slice(0, args.length - 1);
        // }
        if (this.command == null) {
            if (args.length > 0 && typeof args[0] == "string") {
                this.command = this.connection.CreateCommand(args.shift());
                //args = args.slice(1, args.length - 1);
            } else {
                throw new Error("sql is null");
            }
        }
        if (this.command != null) {
            if (args.length > 0) {
                if (typeof args[0] == "object") {
                    const bindObj = args.shift();
                    Object.keys(bindObj).forEach(k => this.command.Bind(k, bindObj[k]));
                } else {
                    args.forEach(v => {
                        if (typeof v == "function") {
                            fn.push(v);
                        } else if (typeof v != "object") {
                            this.command.Bind(v);
                        }
                    });
                }
            }
        } else {
            throw new Error("SqlCommand is null");
        }
        return fn;
    }
    
    all(sql: string, args?: any[], e?: (err: string, rows: any[]) => void): Database {
        if (this.trace) console.log(`all ${JSON.stringify(arguments)}`);
        this.prepare(sql);
        //this.stmt = this.command.Prepare();
        
        return this;
    }
    
    each(...args: any) {
        const cb = this.adapter(args);
        
    }
    
    run(...args: any[]): Database {
        if (this.trace) console.log(`run arguments: ${JSON.stringify(arguments)}`);
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
            if (this.trace) console.log(`changes: ${this.changes}`);
            //if (typeof args == "function") args.apply(this, [null]);
            if (cb.length > 0) cb[0].apply(this, [null]);
        } finally {
            this.command = null;
        }
        
        return this;
    }
    
    finalize(): Database {
        if (this.trace) console.log("finalize");
        this.command = null;
        //this.command.Finalize(this.stmt);
        return this;
    }
    
    close(cb?: (err: string) => void): Database {
        if (this.trace) console.log("close");
        cb?.apply(this, [null]);
        return this;
    }
}
