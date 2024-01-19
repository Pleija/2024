export class Sqlite3Database {
    prepare(sql: string): Sqlite3Database {
        return this;
    }

    serialize(fn: () => any): Sqlite3Database {
        return this;
    }

    all(sql: string, args?: any[], e?: (err: string, rows: any[]) => void): Sqlite3Database {
        return this;
    }

    run(sql: string | any[], args?: ((e: string) => any) | any[], err?: (e: string) => any): Sqlite3Database {
        return this;
    }

    finalize(): Sqlite3Database {
        return this;
    }

    close(cb: (err: string) => void): Sqlite3Database {
        return this;
    }
}

