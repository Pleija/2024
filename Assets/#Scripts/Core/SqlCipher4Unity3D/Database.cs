using System;
using System.Collections.Generic;
using Sqlite3Statement = System.IntPtr;

namespace SqlCipher4Unity3D
{
    public class Database
    {
        public Database(string path, object args, Action<object> onError) { }

        public class Statement
        {
            public Sqlite3Statement stmt;
            public void bind(params object[] param) { }
            public void reset(Action cb) { }
            public void finalize(Action<object> onError) { }
            public void run(string sql, Action<object> onError) { }
            public void get(string sql, Action<object, Dictionary<string, object>> onResult) { }
            public void all(string sql, Action<object, List<Dictionary<string, object>>> onResult) { }

            public void each(string sql, Action<object, Dictionary<string, object>> onResult
                , Action<object, int> onError) { }
        }

        private SQLiteConnection _conn;
        public Database(string filepath) { }
        public Statement prepare(string sql, object param, Action<object> onError) => new Statement() { };
        public Statement prepare(string sql) => BindAll(new Statement() { stmt = SQLite3.Prepare2(_conn.Handle, sql) });
        private Statement BindAll(Statement stmt) => stmt;
        public void backup(params object[] param) { }
        public delegate void OnEvent(params object[] param);
        public void on(string eventName, OnEvent onEvent) { }
        public void open(string path, params object[] param) { }
        public void get(string sql, object param, Action<object, object> onError) { }
        public void all(string sql, object param, Action<object, object> onRow) { }
        public void exec(string sql, object param, Action<object> onError) { }
        public void exec(string sql, Action<object> onError) { }
        public void run(string sql, object param, Action<object> onError) { }
        public void finalize() { }
        public void each(string sql, object param, Action<object, object> onResult, Action<object, int> onError) { }

        public void close(Action<object> onError = null)
        {
            onError?.Invoke(null);
        }

        public void removeAllListeners() { }
        public void serialize(Action cb) { }
        public void parallelize(Action cb) { }
        public static bool isVerbose;

        public static void verbose()
        {
            isVerbose = true;
        }
    }
}
