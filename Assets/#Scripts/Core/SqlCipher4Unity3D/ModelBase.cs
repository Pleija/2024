using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;

namespace SqlCipher4Unity3D
{
    public class ModelBase : ScriptableBase
    {
        public static readonly Dictionary<Type, ModelBase> Defaults = new Dictionary<Type, ModelBase>();

        public static string Md5(string observedText) => string.Join("",
            from ba in MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(observedText)) select ba.ToString("x2"));

        private static SQLiteConnection m_Connection;
        private static string dbPath => $"{Application.persistentDataPath}/{Md5("System")}.db";
        private static string pwd => "6FA2B924-BE3E-4353-9023-F3CCEABE4A74";

        [Ignore]
        public bool isSetup { get; set; }

        public static SQLiteConnection Connection {
            get {
                if (m_Connection != null) return m_Connection;
                m_Connection = new SQLiteConnection(dbPath, pwd);
                return m_Connection;
            }
        }

        [AutoIncrement, PrimaryKey]
        public int Id = 1;

        //[FoldoutGroup("Default")]
        // public string Version = "1.0";

        [FoldoutGroup("Default"), TextArea]
        public string Extra = "{}";

        [FoldoutGroup("Default"), TextArea]
        public string localExtra = "{}";

        [FoldoutGroup("Default")]
        public new string name { get; set; }

        [FoldoutGroup("Default")]
        public new HideFlags hideFlags { get; set; }

        public virtual ModelBase GetSelf() => null;
        public virtual void ResetSelf() { }

        public ModelBase Save()
        {
            Connection.Save(this);
            return this;
        }

        public virtual void OnEnable() { }
        public virtual void SetupFromRedis() { }
    }
}
