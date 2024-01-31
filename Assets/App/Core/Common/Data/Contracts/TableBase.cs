using System;
using System.Collections.Generic;
using Extensions;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using Sirenix.Utilities;

#if UNITY_EDITOR

using Sirenix.Utilities.Editor;
#endif
using SqlCipher4Unity3D;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEditor;
using UnityEngine;
// using SQLite.Attributes;

namespace Data
{
    [Serializable]
    public class TableBase : SerializedScriptableObject
    {
        class RC4
        {
            public static byte[] Encrypt(byte[] pwd, byte[] data)
            {
                int a, i, j, k, tmp;
                int[] key, box;
                byte[] cipher;
                key = new int[256];
                box = new int[256];
                cipher = new byte[data.Length];
                for (i = 0; i < 256; i++) {
                    key[i] = pwd[i % pwd.Length];
                    box[i] = i;
                }

                for (j = i = 0; i < 256; i++) {
                    j = (j + box[i] + key[i]) % 256;
                    tmp = box[i];
                    box[i] = box[j];
                    box[j] = tmp;
                }

                for (a = j = i = 0; i < data.Length; i++) {
                    a++;
                    a %= 256;
                    j += box[a];
                    j %= 256;
                    tmp = box[a];
                    box[a] = box[j];
                    box[j] = tmp;
                    k = box[(box[a] + box[j]) % 256];
                    cipher[i] = (byte)(data[i] ^ k);
                }

                return cipher;
            }

            public static byte[] Decrypt(byte[] pwd, byte[] data)
            {
                return Encrypt(pwd, data);
            }
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
        static void ClearPresets() => presets.Clear();

        static Dictionary<Type, ScriptableObject> _presets;

        public static Dictionary<Type, ScriptableObject> presets {
            get => _presets ??= new Dictionary<Type, ScriptableObject>();
            set => _presets = value;
        }

//        [ SerializeField, HideInInspector ]
//        private SerializationData MySerializationData;
//
//        [ SerializeField, HideInInspector ]
//        bool __useEncrypt;
//
//        void ISerializationCallbackReceiver.OnAfterDeserialize()
//        {
//            if (__useEncrypt) {
//                //RSATool.instance.DecryptByPublicKey(ref this.MySerializationData.SerializedBytes);
//                this.MySerializationData = JsonConvert.DeserializeObject<SerializationData>(
//                    Encoding.UTF8.GetString(RC4.Decrypt(Encoding.UTF8.GetBytes("14D493EB-F144-4A66-8CE5-005DF4879EF4"),
//                        Convert.FromBase64String(__EncryptedData))));
//
//                __EncryptedData = null;
//                __useEncrypt = false;
//            }
//
//            UnitySerializationUtility.DeserializeUnityObject(this, ref this.MySerializationData);
//        }
//
//        [ SerializeField ]
//        string __EncryptedData;

//        void ISerializationCallbackReceiver.OnBeforeSerialize()
//        {
//            UnitySerializationUtility.SerializeUnityObject(this, ref this.MySerializationData, true);
//            __useEncrypt = true;
//
//            __EncryptedData = Convert.ToBase64String(RC4.Encrypt(
//                Encoding.UTF8.GetBytes("14D493EB-F144-4A66-8CE5-005DF4879EF4"),
//                Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(this.MySerializationData))));
//
//            this.MySerializationData.Reset();
//        }
        public static readonly Dictionary<Type, TableBase> instances = new Dictionary<Type, TableBase>();

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
        static void InitClear() => instances.Clear();

        // protected static TableBase m_Instance => instances.TryGetValue();
        protected bool m_TableInited;

        protected virtual void OnEnable()
        {
            m_TableInited = true;
            if (!instances.TryGetValue(GetType(), out var test) || test == null) {
                instances[GetType()] = this;
                Debug.Log(GetType().FullName + " loaded".ToYellow());
            }
        }

        protected virtual void OnDisable()
        {
            if (!instances.TryGetValue(GetType(), out var test) || test == null) {
                instances[GetType()] = null;
                Debug.Log(GetType().FullName + " unloaded".ToYellow());
            }
        }

        [Unique]
        [PrimaryKey]
        [AutoIncrement]
        [OdinSerialize]
        [ReadOnly]
        public virtual int Id { get; set; }

        [OdinSerialize] [FoldoutGroup("base")] public virtual bool IsUser { get; set; }

        [Ignore]
        public new string name {
            get => base.name;
            set => base.name = value;
        }

        [Ignore]
        public new HideFlags hideFlags {
            get => base.hideFlags;
            set => base.hideFlags = value;
        }

        public virtual void Init()
        {
            if (!instances.TryGetValue(GetType(), out var test) || test == null) {
                instances[GetType()] = this;
                Debug.Log(GetType().GetNiceFullName() + " Initial".ToYellow());
            }
        }

        [OdinSerialize]
        [Title("是否启用 ", HorizontalLine = false)]
        [FoldoutGroup("base")]
        public bool Enabled { get; set; } = true;

        [OdinSerialize]
        [ReadOnly]
        [FoldoutGroup("base")]
        public virtual long Created { get; set; } = Core.TimeStamp();

        [OdinSerialize]
        [ReadOnly]
        [FoldoutGroup("base")]
        public virtual long Updated { get; set; } = Core.TimeStamp();

        long FriendlyTime(long timestamp, GUIContent label)
        {
#if UNITY_EDITOR
            SirenixEditorGUI.BeginBox();

            //callNextDrawer(label);
            if (timestamp > 0) EditorGUILayout.HelpBox(Core.RelativeFriendlyTime(timestamp), MessageType.None);

            var result = EditorGUILayout.LongField(label ?? new GUIContent(""), timestamp);

            //var result = EditorGUILayout.Slider(value, this.From, this.To);
            SirenixEditorGUI.EndBox();
            return result;
#endif
            return default;
        }

        public SQLiteConnection _db =>
            DbTable.Connection; //IsUser ? Core.UserConnection : Core.Connection;

        //
        // public static T CreateOne<T>() where T : TModel<T>, new()
        // {
        //     return CreateInstance<T>();
        // }
    }
}
