#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.AddressableAssets;
#endif
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Common;
using Newtonsoft.Json;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using Sirenix.Utilities;
using SQLite.Attributes;
using UniRx;
using UnityEngine;
using UnityEngine.AddressableAssets;
using Task = System.Threading.Tasks.Task;

namespace SqlCipher4Unity3D
{
    [ShowOdinSerializedPropertiesInInspector]
    public class Model : ScriptableObject, ISerializationCallbackReceiver
    {
        public static readonly Dictionary<Type, Model> Defaults = new Dictionary<Type, Model>();

        public static string Md5(string observedText)
        {
            return string.Join("",
                from ba in MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(observedText))
                select ba.ToString("x2"));
        }

        private static SQLiteConnection m_Connection;
        private static string dbPath => $"{Application.persistentDataPath}/{Md5("System")}.db";
        private static string pwd => "6FA2B924-BE3E-4353-9023-F3CCEABE4A74";

        [Ignore]
        public bool isSetup { get; set; }

        public static SQLiteConnection conn {
            get {
                if(m_Connection != null) return m_Connection;
                m_Connection = new SQLiteConnection(dbPath, pwd);
                return m_Connection;
            }
        }

        public static async Task LoadAll()
        {
            var types = new List<string>();

            foreach(var x in Res.Exists<Model>()) {
                // await Addressables.DownloadDependenciesAsync(x).Task;
                if(Defaults.ContainsKey(x.ResourceType)) continue;
                types.Add($"{x.ResourceType.FullName} => {x.PrimaryKey}");
                Defaults[x.ResourceType] = await Addressables.LoadAssetAsync<Model>(x).Task;
            }
            Debug.Log($"all models: {string.Join(", ", types)}");
        }

        [AutoIncrement, PrimaryKey]
        public int Id = 1;

        [FoldoutGroup("Default")]
        public string Version = "1.0";

        [FoldoutGroup("Default")]
        [TextArea]
        public string Extra = "{}";

        [FoldoutGroup("Default")]
        [TextArea]
        public string localExtra = "{}";

        [FoldoutGroup("Default")]
        public new string name { get; set; }

        [FoldoutGroup("Default")]
        public new HideFlags hideFlags { get; set; }

        public Model GetSelf() => null;

        public Model Save()
        {
            conn.Save(this);
            return this;
        }

        [SerializeField, HideInInspector]
        private SerializationData serializationData;

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            if(this == null) return;
            UnitySerializationUtility.DeserializeUnityObject(this, ref this.serializationData);
        }

        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            if(this == null) return;
            UnitySerializationUtility.SerializeUnityObject(this, ref this.serializationData);
        }
    }

    public class DataModelSample : DataModel<DataModelSample> { }

    public class DataModel<T> : Model where T : DataModel<T>
    {
        private static T m_Instance;

        public static T self => m_Instance ??= conn.Table<T>().FirstOrInsert(value => {
            //value ??= CreateInstance<T>();
            if(!Defaults.TryGetValue(typeof(T), out var result) || result == null) {
#if UNITY_EDITOR
                if(!Application.isPlaying) {
                    result = AssetDatabase.FindAssets($"t:{typeof(T).FullName}").Select(x =>
                            AssetDatabase.LoadAssetAtPath<T>(AssetDatabase.GUIDToAssetPath(x)))
                        .FirstOrDefault();
                }
#endif
                if(result == null && Res.Exists<T>() is { } locations) {
                    result = Defaults[typeof(T)] = Addressables
                        .LoadAssetAsync<T>(locations.First().PrimaryKey).WaitForCompletion();
                    Debug.Log($"Load: {typeof(T).Name} => {locations.First().PrimaryKey}");
                }

                if(result == null) {
                    Debug.Log($"{typeof(T).Name} asset not found");
                }
            }
#if UNITY_EDITOR
            // if(!Application.isEditor) return;

            if((result == null || AssetDatabase.GetAssetPath(result) == null)) {
                var settings = AddressableAssetSettingsDefaultObject.Settings;
                //var entries = settings.groups.SelectMany(x => x.entries);
                result = Defaults[typeof(T)] = value; //CreateInstance<T>();
                var path = $"Assets/Res/Config/{typeof(T).FullName}.asset";

                if(!Directory.Exists(Path.GetDirectoryName(path))) {
                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                }
                AssetDatabase.CreateAsset(value, path);
                AssetDatabase.Refresh();
                //AssetDatabase.SaveAssets();
                result = AssetDatabase.LoadAssetAtPath<T>(path);
                // var entry = settings.CreateOrMoveEntry(AssetDatabase.AssetPathToGUID(path),
                //     settings.DefaultGroup);
                // entry.address = typeof(T).FullName;
            }
#endif

            if(result) {
                Setup(result, value);
            }
            else {
                Debug.Log($"{typeof(T).FullName} asset not found");
            }
        });

        public new Model GetSelf() => self;

        public static void Setup(Model config, T target)
        {
            target.isSetup = true;
            typeof(T).GetMembers(BindingFlags.Public | BindingFlags.Instance)
                .Where(x => !x.IsDefined(typeof(IgnoreAttribute), true)).ForEach(x => {
                    object value = null;

                    if(Regex.IsMatch(x.Name, @"^[A-Z]")) {
                        switch(x) {
                            case PropertyInfo { CanRead: true, CanWrite: true } propertyInfo:
                                value = propertyInfo.GetValue(config, null) ??
                                    Activator.CreateInstance(propertyInfo.PropertyType);
                                propertyInfo.SetValue(target, value);
                                break;
                            case FieldInfo fieldInfo:
                                value = fieldInfo.GetValue(config) ??
                                    Activator.CreateInstance(fieldInfo.FieldType);
                                fieldInfo.SetValue(target, value);
                                break;
                        }
                    }
                    else {
                        switch(x) {
                            case PropertyInfo { CanRead: true, CanWrite: true } propertyInfo:
                                //Debug.Log($"check property: {x.Name}");
                                value = propertyInfo.GetValue(target, null);
                                break;
                            case FieldInfo fieldInfo:
                                // Debug.Log($"check field: {x.Name}");
                                value = fieldInfo.GetValue(target);
                                break;
                        }
                    }

                    void ToSave(object t)
                    {
                        if(target.isSetup) return;
                        Debug.Log($"Save {typeof(T).FullName} => {x.Name} = {t}");
                        target.Save();
                    }

                    switch(value) {
                        case IntReactiveProperty intReactiveProperty:
                            //Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                            intReactiveProperty.Subscribe(t => ToSave(t));
                            break;
                        case StringReactiveProperty stringReactiveProperty:
                            //Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                            stringReactiveProperty.Subscribe(t => ToSave(t));
                            break;
                        case BoolReactiveProperty boolReactiveProperty:
                            //Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                            boolReactiveProperty.Subscribe(t => ToSave(t));
                            break;
                    }
                });
            target.isSetup = false;
        }

        [ButtonGroup("2")]
        void TestSave()
        {
            Save();
            Debug.Log(JsonConvert.SerializeObject(conn.Table<T>().FirstOrDefault(),
                Formatting.Indented));
        }

        public new T Save()
        {
            conn.Save(this);
            return (T)this;
        }

        public static T Load(Expression<Func<T, bool>> predExpr, Action<T> aAction = null)
        {
            var result = conn.Table<T>().FirstOrInsert(predExpr, aAction);
            Setup(self, result);
            return result;
        }

        // void SaveConfig()
        // {
        //     Model.conn.Save(this);
        // }
    }
}
