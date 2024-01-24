#region
using System;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.RegularExpressions;
using Models;
using Newtonsoft.Json;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using SqlCipher4Unity3D.SQLite.Attribute;
using UniRx;
using UnityEngine;
using UnityEngine.AddressableAssets;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.AddressableAssets;
#endif
#endregion

namespace SqlCipher4Unity3D
{
    //public class DataModelSample : DataModel<DataModelSample> { }

    public class DataModel<T> : ModelBase where T : DataModel<T>
    {
        private static T m_Instance;

        public static T self {
            get {
                if (m_Instance) return m_Instance;
                // #if UNITY_EDITOR
                //                 if (EditorApplication.isCompiling || EditorApplication.isUpdating) return m_Instance;
                // #endif
                InnerResetSelf();
                return m_Instance;
            }
        }

        public override void OnEnable()
        {
            //             base.OnEnable();
            //             Defaults[GetType()] = m_Instance = this as T;
            // #if UNITY_EDITOR
            //             if (EditorApplication.isCompiling || EditorApplication.isUpdating) return;
            // #endif
            //             InnerResetSelf();
        }

#if UNITY_EDITOR
        public virtual void OnValidate()
        {
            if (!EditorApplication.isCompiling && !EditorApplication.isUpdating) {
                //Debug.Log($"OnValidate: {GetType().Name}");
                Redis.Database.StringSet(typeof(T).FullName, JsonUtility.ToJson(this));
                Redis.Publish("update", typeof(T).FullName);
            }
        }
#endif
        public override void ResetSelf() => InnerResetSelf();

        public static void InnerResetSelf()
        {
            Connection.Table<T>()
                    .FirstOrInsert(table => {
                        //value ??= CreateInstance<T>();
                        if (!Defaults.TryGetValue(typeof(T), out var result) || result == null) {
#if UNITY_EDITOR
                            //if (!Application.isPlaying) {
                            result = AssetDatabase.FindAssets($"t:{typeof(T).FullName}")
                                    .Select(x =>
                                            AssetDatabase.LoadAssetAtPath<T>(
                                                AssetDatabase.GUIDToAssetPath(x)))
                                    .FirstOrDefault();
                            // }
#endif
                            if (Application.isPlaying && !Application.isEditor)
                                if (result == null && Res.Exists<T>() is { } locations) {
                                    result = Addressables.LoadAssetAsync<T>(locations.PrimaryKey)
                                            .WaitForCompletion();
                                    Debug.Log($"Load: {typeof(T).Name} => {locations.PrimaryKey}");
                                }
                            if (result == null) Debug.Log($"{typeof(T).Name} asset not found");
                        }
#if UNITY_EDITOR
                        // if(!Application.isEditor) return;

                        if (result == null || AssetDatabase.GetAssetPath(result) == null) {
                            var settings = AddressableAssetSettingsDefaultObject.Settings;
                            //var entries = settings.groups.SelectMany(x => x.entries);
                            result = Defaults[typeof(T)] = table; //CreateInstance<T>();
                            var path = $"Assets/Res/Config/{typeof(T).Name}.asset";
                            if (!Directory.Exists(Path.GetDirectoryName(path)))
                                Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                            AssetDatabase.CreateAsset(table, path);
                            AssetDatabase.Refresh();
                            //AssetDatabase.SaveAssets();
                            result = AssetDatabase.LoadAssetAtPath<T>(path);
                            // var entry = settings.CreateOrMoveEntry(AssetDatabase.AssetPathToGUID(path),
                            //     settings.DefaultGroup);
                            // entry.address = typeof(T).FullName;
                        }
#endif

                        //if (result) {
                        Defaults[typeof(T)] = m_Instance = result as T;
                        Setup(result, table);
                        if ((Application.isEditor || Debug.isDebugBuild) && Application.isPlaying)
                            result.SetupFromRedis();
                        // }
                        // else {
                        //     Debug.Log($"{typeof(T).FullName} asset not found");
                        // }
                    });
        }

        public override void SetupFromRedis()
        {
            var json = Redis.Database.StringGet(GetType().FullName);
            var value = CreateInstance<T>();
            JsonUtility.FromJsonOverwrite(json, value);
            value.GetType()
                    .GetMembers(
                        BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                    .Where(x => Regex.IsMatch(x.Name, @"^[A-Z]"))
                    .ForEach(mi => {
                        if (mi is PropertyInfo { CanRead: true, CanWrite: true } propertyInfo) {
                            var newValue = propertyInfo.GetValue(value, null);
                            var oldValue = propertyInfo.GetValue(this, null);

                            switch (oldValue) {
                                case IntReactiveProperty intReactiveProperty:
                                    intReactiveProperty.Value =
                                            ((IntReactiveProperty)newValue).Value;
                                    break;
                                case StringReactiveProperty stringReactive:
                                    stringReactive.Value =
                                            ((StringReactiveProperty)newValue).Value;
                                    break;
                                case FloatReactiveProperty floatReactive:
                                    floatReactive.Value =
                                            ((FloatReactiveProperty)newValue).Value;
                                    break;
                                default:
                                    propertyInfo.SetValue(this, newValue);
                                    break;
                            }
                        }
                        else if (mi is FieldInfo fieldInfo) {
                            var newValue = fieldInfo.GetValue(value);
                            var oldValue = fieldInfo.GetValue(this);

                            switch (oldValue) {
                                case IntReactiveProperty intReactiveProperty:
                                    intReactiveProperty.Value =
                                            ((IntReactiveProperty)newValue).Value;
                                    break;
                                case StringReactiveProperty stringReactive:
                                    stringReactive.Value =
                                            ((StringReactiveProperty)newValue).Value;
                                    break;
                                case FloatReactiveProperty floatReactive:
                                    floatReactive.Value =
                                            ((FloatReactiveProperty)newValue).Value;
                                    break;
                                default:
                                    fieldInfo.SetValue(this, newValue);
                                    break;
                            }
                        }
                    });
            //Debug.Log($"setup finish: {GetType().FullName}");
        }

        public override ModelBase GetSelf() => self;

        public static void Setup(ModelBase asset, T table)
        {
            asset.isSetup = true;
            typeof(T).GetMembers(BindingFlags.Public | BindingFlags.Instance)
                    .Where(x => !x.IsDefined(typeof(IgnoreAttribute), true))
                    .ForEach(x => {
                        object value = null;

                        if (!Regex.IsMatch(x.Name, @"^[A-Z]"))
                            switch (x) {
                                case PropertyInfo { CanRead: true, CanWrite: true, } propertyInfo:
                                    value = propertyInfo.GetValue(table, null)
                                            ?? (propertyInfo.PropertyType == typeof(string) ? ""
                                                    : Activator.CreateInstance(propertyInfo
                                                            .PropertyType));
                                    propertyInfo.SetValue(asset, value);
                                    break;
                                case FieldInfo fieldInfo:
                                    value = fieldInfo.GetValue(table)
                                            ?? (fieldInfo.FieldType == typeof(string) ? ""
                                                    : Activator.CreateInstance(fieldInfo
                                                            .FieldType));
                                    fieldInfo.SetValue(asset, value);
                                    break;
                            }
                        else
                            switch (x) {
                                case PropertyInfo { CanRead: true, CanWrite: true, } propertyInfo:
                                    //Debug.Log($"check property: {x.Name}");
                                    value = propertyInfo.GetValue(asset, null);
                                    break;
                                case FieldInfo fieldInfo:
                                    // Debug.Log($"check field: {x.Name}");
                                    value = fieldInfo.GetValue(asset);
                                    break;
                            }

                        void ToSave(object t)
                        {
                            if (asset.isSetup) return;
                            //Debug.Log($"Save {typeof(T).FullName} => {x.Name} = {t}");
                            asset.Save();
                        }

                        switch (value) {
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
            asset.isSetup = false;
        }

        [ButtonGroup("2")]
        private void TestSave()
        {
            Save();
            Debug.Log(JsonConvert.SerializeObject(Connection.Table<T>().FirstOrDefault(),
                Formatting.Indented));
        }

        [ButtonGroup("2")]
        public void Drop()
        {
            Connection.DropTable<T>();
        }

        public new T Save()
        {
            Connection.Save(this);
            return (T)this;
        }

        public static T Load(Expression<Func<T, bool>> predExpr, Action<T> aAction = null)
        {
            var result = Connection.Table<T>().FirstOrInsert(predExpr, aAction);
            Setup(self, result);
            return result;
        }
        // void SaveConfig()
        // {
        //     Model.conn.Save(this);
        // }
    }
}
