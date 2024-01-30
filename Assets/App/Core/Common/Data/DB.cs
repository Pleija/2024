using System;
using System.Linq.Expressions;
using SqlCipher4Unity3D;

namespace Data
{
    public static class DB
    {
        public static SQLiteConnection Connection => DbTable.Connection;
        static SQLiteConnection m_Memory;

        // public static SQLiteConnection memory => m_Memory ?? ( m_Memory = new SQLiteConnection(":memory:", "DC2F9B09-679C-4E27-ADE1-03BBB9231B3D") );

//
//    public static SQLiteConnection storage => Connection;
        public static void CreateTable<T>(T obj = default) where T : IData {
            Connection.CreateTable<T>();
        }

        public static T Insert<T>(T obj) where T : IData {
            return Update(obj);

//        Connection.CreateTable<T>();
//        //Connection.InsertWithChildren(obj, true);
//        Connection.InsertOrReplace(obj);
//       // Connection.InsertOrReplaceWithChildren(obj, true);
//
//        return obj;
        }

        public static T Load<T>(Expression<Func<T, bool>> predExpr = null, T target = default) where T : class, IData, new() {
            return Table<T>().FirstOrDefault(predExpr);
        }

        public static TableQuery<T> Table<T>(T obj = default) where T : class, new() {
            return Connection.Table<T>();
        }

        public static T Save<T>(T obj) where T : IData {
            return Update(obj);
        }

        public static T FirstOrDefault<T>(Expression<Func<T, bool>> predExpr, T target = default)
            where T : class, IData, new() {
            return Table<T>().FirstOrDefault(predExpr);
        }

        public static T Update<T>(T obj) where T : IData {
            Connection.CreateTable<T>();
            obj.Updated = Core.TimeStamp();
            if (obj.Id == 0)
                Connection.Insert(obj);
            else
                Connection.InsertOrReplace(obj);

            //Connection.InsertOrReplaceWithChildren(obj, true);
            return obj;
        }

        //[Kernel.Handle]
        public static int Delete(object obj) {
            return Connection.Delete(obj);
        }
    }
}
