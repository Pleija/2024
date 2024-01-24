#region
using System;
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace SqlCipher4Unity3D
{
    public abstract class DataScheme : ScriptableBase
    {
        public Version version;
        public string tableName;
        public string mappingKey;
        public bool withoutRowId;
        public Func<object> OnCreateRow;
        public readonly List<Field> fields = new List<Field>();

        // public CreateFlags createFlags = CreateFlags.None;
        public TableMapping.Column[] columns;
        public virtual object GetValue(TableMapping.Column column, object obj) => obj;
        public virtual void SetValue(TableMapping.Column column, object obj, object val) { }

        public static explicit operator DataScheme(Type type) =>
                CreateInstance<TypeDataScheme>().Create(type);

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

            [SerializeField]
            private string m_Type;

            public Type type {
                get => Type.GetType(m_Type);
                set => m_Type = value?.AssemblyQualifiedName;
            }
        }
    }
}
