import SQLiteCommand = CS.SqlCipher4Unity3D.SQLiteCommand;
import ModelBase = CS.SqlCipher4Unity3D.ModelBase;
import IntPtr = CS.System.IntPtr;

export class Database {
    sqliteCommand: SQLiteCommand;
    stmt: IntPtr;

    constructor() {
        this.sqliteCommand = new SQLiteCommand(ModelBase.Connection);
    }

    prepare(sql: string): Database {
        this.sqliteCommand.CommandText = sql;
        //this.stmt = this.sqliteCommand.Prepare();
        this.sqliteCommand.ClearBind();
        return this;
    }

    serialize(fn: () => any): Database {
        fn();
        return this;
    }

    all(sql: string, args?: any[], e?: (err: string, rows: any[]) => void): Database {
        this.prepare(sql);

        return this;
    }

    run(sql: string | any[], args?: ((e: string) => any) | any[], err?: (e: string) => any): Database {
        if (Array.isArray(sql)) {
            sql.forEach(t => this.sqliteCommand.Bind(t));

        } else {
            this.prepare(sql);
            (args as []).forEach(t => this.sqliteCommand.Bind(t));
        }
        const rowsAffected = this.sqliteCommand.ExecuteNonQuery();
        if (typeof args == "function") args(null);
        if (typeof err == "function") err(null);
        return this;
    }

    finalize(): Database {
        this.sqliteCommand.Finalize(this.stmt);
        return this;
    }

    close(cb: (err: string) => void): Database {
        cb(null);
        return this;
    }
}

