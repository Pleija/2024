using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Sirenix.Serialization;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;
using Sqlite3Statement = System.IntPtr;

namespace SqlCipher4Unity3D
{
    public abstract class DataScheme : ScriptableBase
    {
        [Serializable]
        public class Field
        {
            public string name;
            public bool isPK;
            public bool isAutInc;
            public bool isIgnore;
            public string jsonData;
            public object rawData;
            public Func<object, object> OnRead;
            public Func<object, object> OnWrite;

            public Type type {
                get => Type.GetType(m_Type);
                set => m_Type = value?.AssemblyQualifiedName;
            }

            [SerializeField]
            private string m_Type;
        }

        public Version version;
        public string tableName;
        public string mappingKey;
        public bool withoutRowId;
        public readonly List<Field> fields = new List<Field>();
        public Func<object> OnCreateRow;

        // public CreateFlags createFlags = CreateFlags.None;
        public TableMapping.Column[] columns;
        public virtual object GetValue(TableMapping.Column column, object obj) => obj;
        public virtual void SetValue(TableMapping.Column column, object obj, object val) { }
        public static explicit operator DataScheme(Type type) => CreateInstance<TypeDataScheme>().Create(type);
    }
}
