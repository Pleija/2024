using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Extensions;

// using SQLiteNetExtensions.Extensions;
#if UNITY_EDITOR
#endif

namespace Data
{
    [Serializable]
    [ShowOdinSerializedPropertiesInInspector]
    public class Table<T> : DbData where T : Table<T>, new()
    {
        //
        // [Ignore]
        // public T Value { get; set; }

        // [AutoIncrement, PrimaryKey, OdinSerialize]
        // public int Id { get; set; }
        static SQLiteConnection _db => DbTable.Connection;
        static TableQuery<T> m_Query;

        public static TableQuery<T> table => m_Query ??= _db.Table<T>().Of(t => {
            // 同步数据库结构
            _db.CreateTable<T>();
        });

        // public void Update()
        // {
        //     _db.CreateTable<T>();
        //     Updated = Core.TimeStamp();
        //     _db.UpdateWithChildren(this);
        // }

        public static void Insert(T row) {
            //Debug.Log(typeof(T).FullName);
            _db.CreateTable<T>();
            row.Updated = Core.TimeStamp();
            if (row.Id == 0)

                //if (replace) {
                _db.InsertOrReplaceWithChildren(row, true);

            // } else {
            //     _db.InsertWithChildren(this, true);
            // }
            else
                _db.UpdateWithChildren(row);
        }

        public static List<T> FetchAll(Expression<Func<T, bool>> predExpr = null) {
            return table.FetchAll(predExpr);
        }

        public static void Delete(T row) {
            _db.Delete(row);
        }

        public static void Delete(Expression<Func<T, bool>> predExpr) {
            new TableQuery<T>(_db).Delete(predExpr);

            //TableQuery<T>().Delete(row);
        }

        public static T Fetch(T row) {
            _db.GetChildren(row, true);
            return row;
        }

        public static TableQuery<T> Where(Expression<Func<T, bool>> predExp) {
            return _db.Table<T>().Where(predExp);
        }

        public static T FirstOrInsert(Expression<Func<T, bool>> predExpr = null, Action<T> add = null) {
            var row = table.Where(predExpr).FirstOrDefault();
            Insert(row);
            if (add != null) {
                add.Invoke(row);
                Insert(row);
            }

            return row;
        }

        // public static T UpdateWhere(Expression<Func<T, bool>> predExpr = null, Action<T> add = null)
        // {
        //     var row = table.Where(predExpr).FirstOrDefault();
        //
        //     if (row.Id != 0) {
        //         add?.Invoke(row);
        //         row.Update();
        //     }
        //
        //     return row;
        // }

        // public static T FirstOrDefault()
        // {
        //     var query = _db.Table<T>().Take(1);
        //     var ret = query.ToList().FirstOrDefault();
        //
        //     // 同步数据库结构
        //     _db.CreateTable<T>();
        //     if (ret == null) {
        //         ret = new T();
        //         _db.Insert(ret);
        //     }
        //     _db.GetChildren(ret, true);
        //     return ret;
        // }

        public void SaveAsFirst(int id = 1) {
            Id = id;
            Insert(this as T);
        }

        //[Button]
        //[TitleGroup("Common/Database")]
        // [ButtonGroup("Common")]
        // public void Refresh()
        // {
        //     GetType()
        //         .GetProperties()
        //         .ForEach(attr => {
        //             if (attr.CanWrite) {
        //                 attr.SetValue(this, attr.GetValue(this));
        //             }
        //         });
        //     GetType()
        //         .GetFields()
        //         .ForEach(attr => {
        //             attr.SetValue(this, attr.GetValue(this));
        //         });
        // }

        // public static void LoadWhere(Expression<Func<T, bool>> predExp = null, Action action = null)
        // {
        //     var tmp = FirstOrInsert(predExp);
        //     var id = Id;
        //     LoadDefault(tmp);
        //
        //     if (id != Id) {
        //         action?.Invoke();
        //         Insert();
        //
        //     }
        // }

        // public void Update()
        // {
        //     Insert();
        //
        //     //     _db.CreateTable<T>();
        //     //     Updated = Core.TimeStamp();
        //     //     _db.UpdateWithChildren(this);
        // }

        //[Button]
        //[TitleGroup("Common/Database")]
        //[ButtonGroup("Common"), TableColumnWidth(0),HideInInspector]
        public void SaveToFirst() {
            var tmp = FirstOrInsert();
            Id = tmp.Id;
            Insert(tmp);

            //Refresh();
        }

        //[ButtonGroup("Common"), TableColumnWidth(0),HideInInspector]
        public static void DropTable() {
            _db.DropTable<T>();

            //_db.CreateTable<T>();
        }

        public static void LoadDefault(T src, T dest) {
            var tInType = src.GetType();
            foreach (var itemOut in typeof(T).GetProperties()) {
                if (!itemOut.CanWrite) continue;

                var itemIn = tInType.GetProperty(itemOut.Name);
                if (itemIn != null) itemOut.SetValue(dest, itemIn.GetValue(src));
            }

            // this.GetType()
            //     .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            //     .Where(property => property.CanRead) // Not necessary
            //     .ForEach(property => property.SetValue(origin,
            //         origin.GetType().GetProperties().Where(ta => ta == property).Select(tb => tb.GetValue(origin))));
        }
    }
}
