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
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Common;
using Newtonsoft.Json;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using SQLite.Attributes;
using UniRx;
using UnityEngine;
using UnityEngine.AddressableAssets;
using Task = System.Threading.Tasks.Task;

namespace SqlCipher4Unity3D
{
    public class Model : SerializedScriptableObject
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

        public static SQLiteConnection conn {
            get {
                if(m_Connection != null) return m_Connection;
                m_Connection = new SQLiteConnection(dbPath, pwd);
                return m_Connection;
            }
        }

        public static async Task LoadAll()
        {
            foreach(var x in Res.Exists<Model>()) {
                // await Addressables.DownloadDependenciesAsync(x).Task;
                Defaults[x.ResourceType] = await Addressables.LoadAssetAsync<Model>(x).Task;
            }
        }

        [AutoIncrement, PrimaryKey]
        public int Id = 1;

        public string Version = "1.0";
        public string Extra = "{}";
        public string localExtra = "{}";

        public Model Save()
        {
            conn.Save(this);
            return this;
        }
    }

    public class DataModelSample : DataModel<DataModelSample> { }

    public class DataModel<T> : Model where T : DataModel<T>
    {
        private static T m_Instance;

        public new static T self => m_Instance ??= conn.Table<T>().FirstOrInsert(value => {
            if(!Defaults.TryGetValue(typeof(T), out var result) || result == null) {
                if(Res.Exists<T>() is { } locations) {
                    result = Defaults[typeof(T)] = Addressables
                        .LoadAssetAsync<T>(locations.First().PrimaryKey).WaitForCompletion();
                    Debug.Log($"Load: {typeof(T).Name} => {locations.First().PrimaryKey}");
                }
                else {
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
                result = AssetDatabase.LoadAssetAtPath<T>(path);
                var entry = settings.CreateOrMoveEntry(AssetDatabase.AssetPathToGUID(path),
                    settings.DefaultGroup);
                entry.address = typeof(T).FullName;
                AssetDatabase.SaveAssets();
            }
#endif

            if(result) {
                Setup(result, value);
            }
            else {
                Debug.Log($"{typeof(T).FullName} asset not found");
            }
        });

        public static void Setup(Model config, T target)
        {
            typeof(T).GetMembers(BindingFlags.Public | BindingFlags.Instance).ForEach(x => {
                object value = null;

                if(Regex.IsMatch(x.Name, @"^[A-Z]")) {
                    switch(x) {
                        case PropertyInfo { CanRead: true, CanWrite: true } propertyInfo:
                            value = propertyInfo.GetValue(config) ??
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
                            value = propertyInfo.GetValue(target);
                            break;
                        case FieldInfo fieldInfo:
                            value = fieldInfo.GetValue(target);
                            break;
                    }
                }

                void ToSave(object t)
                {
                    Debug.Log($"Save {typeof(T).FullName} => {x.Name} = {t}");
                    target.Save();
                }

                switch(value) {
                    case IntReactiveProperty intReactiveProperty:
                        Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                        intReactiveProperty.Subscribe(t => ToSave(t));
                        break;
                    case StringReactiveProperty stringReactiveProperty:
                        Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                        stringReactiveProperty.Subscribe(t => ToSave(t));
                        break;
                    case BoolReactiveProperty boolReactiveProperty:
                        Debug.Log($"Setup: {typeof(T).Name}.{x.Name}");
                        boolReactiveProperty.Subscribe(t => ToSave(t));
                        break;
                }
            });
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
