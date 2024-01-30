using System;
using System.Linq.Expressions;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
using SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Extensions;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Assertions;
//using Runtime.Agents;
// using SQLite.Attributes;
// using SQLiteNetExtensions.Extensions;
#if ECS
using Unity.Entities;
#endif

namespace Data
{
    //[CreateAssetMenu(fileName = nameof(Model<T>), menuName = "Custom/Models/" + nameof(Model<T>), order = 0)]
    public class Model<TModel> : TableBase, IData, ISingleScriptable /*, IObjectInitializationDataProvider*/
        where TModel : Model<TModel>, new()
    {
        public static TableQuery<T1> Table<T1>(T1 obj = default) where T1 : class, new() {
            return DB.Table<T1>();
        }

        public static TableQuery<TModel> db => DB.Table<TModel>();

        //public static T CreateOne() => ScriptableObject.CreateInstance<T>();

        public void SaveChange(bool force = false) {
            if (!m_TableInited) return;

            #if UNITY_EDITOR
            if (!Application.isPlaying || force) {
                UnityEditor.EditorUtility.SetDirty(this);
                Debug.Log("set dirty");
                UnityEditor.AssetDatabase.SaveAssets();

                //UnityEditor.AssetDatabase.Refresh();
            }
            #endif
        }

        protected static void SetValue<T1>(ref T1 target, T1 value) {
            target = value;

            // if (m_Instance != null) {
            //     m_Instance.SaveChange();
            // }
        }

        [SerializeField]
        [HideInInspector]
        Type m_DefaultState = typeof(IIdleState);

        // [OdinSerialize]
        // public bool AUTO_SAVE { get; set; }

        // public static SQLiteConnection knex_db => Core.Connection;
        //
        // [ PrimaryKey, AutoIncrement, OdinSerialize,ShowInInspector ]
        // public virtual int Id { get; set; }
        #if ECS
    [Ignore, FoldoutGroup("System"), FormerlySerializedAs("m_Mothod"), ValueDropdown(nameof(GetSystemMethod))]
    public string m_Method;
        #endif
        #if ECS
    [Ignore, FoldoutGroup("System"), ValueDropdown(nameof(GetSystemList))]
    public Type m_System;
        #endif
        public static bool hasInstance => instances.TryGetValue(typeof(TModel), out var value) && value is TModel;

        public static TModel instance {
        #region Instance define

            get {
                Assert.IsNotNull(presets, "_presets != null");
                if (!instances.TryGetValue(typeof(TModel), out var test) || !test) {
                   // instances.Remove(typeof(TModel));
                   instances[typeof(TModel)] = null;

//					if (presets == null) {
//						LoadAllAssets();
//					}

                   // Assert.IsNotNull(presets, "_presets != null");

                    if (presets.TryGetValue(typeof(TModel), out var ret) && !instances[typeof(TModel)])
                        instances[typeof(TModel)] = ret as TModel;

                    if (!instances[typeof(TModel)]) {
                        var assetName = "Config/" + typeof(TModel).Name + ".asset";
                        Addressables.DownloadDependenciesAsync(assetName)
                            .WaitForCompletion();
                        instances[typeof(TModel)] = Addressables.LoadAssetAsync<TModel>(assetName).WaitForCompletion();
                    }

                    if (!instances[typeof(TModel)]/*  && !Application.isPlaying*/)
                        instances[typeof(TModel)] = Core.FindOrCreatePreloadAsset<TModel>();

                    Assert.IsNotNull(instances[typeof(TModel)],
                        $"instances[{typeof(TModel).GetNiceFullName()}] != null");

                    // Core.FindOrCreatePreloadAsset<T>(); // Res.Load<T>() ?? CreateInstance<T>();
                }

                //if(m_Instance == null) {
                //UniTask.WhenAll(loadInstance($"Config/{typeof(T).Name}.asset"));

                //m_Instance = Resources.Load<T>($"Data/{typeof(T).Name}");
                // if ( m_Instance == null ) {
                //     loadInstance($"{fileName}.asset")
                //         .ToObservable( /*Scheduler.Immediate*/)
                //         .Subscribe(t => { m_Instance = t; });
                // }

                //Resources.Load<T>("Config/" + typeof(T).Name);
                //}

                // if(m_Instance == null) {
                //     Debug.LogError("Config/" + typeof(T).Name + ".asset not exist");
                // }
                return instances[typeof(TModel)] as TModel;
            }

        #endregion
        }

        [Ignore]
        public Type CurrentState { get; set; }

        [Ignore]
        public Type DefaultState {
            get => m_DefaultState;
            set => m_DefaultState = value;
        }

        public void RunMethod(Type type, object target, Type state = null, object[] values = null) { }

        protected virtual void Awake() {
            if (!instances.TryGetValue(GetType(), out var test)
                || test == null) instances[GetType()] = this; // Res.Load<T>() ?? CreateInstance<T>();
        }

        // protected virtual void OnValidate()
        // {
        //     Debug.Log("saved");
        //     Save();
        // }
        public static TModel GetInstance() {
            return instance;
        }

        public static TModel Create() {
            return CreateInstance<TModel>();
        }

        protected virtual void OnValidate() {
            // if (m_Instance == this) {
            //     SaveChange();
            // }
        }
        #if ECS
    Type[] GetSystemList()
    {
        return Core.GetTypes<SystemBase>()
            .Where(t => t.BaseType != null &&
                t.BaseType.IsGenericType && t.BaseType.GetGenericArguments().Last() == typeof(T))
            .ToArray();
    }
        #endif
        #if ECS
    string[] GetSystemMethod()
    {
        return m_System
            ?.GetMethods(BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public |
                BindingFlags.DeclaredOnly)
            .Select(mi => mi.Name)
            .Where(s => !new[] { "OnUpdate", "OnCreate" }.Contains(s))
            .ToArray();
    }
        #endif
        #if ECS
    [FoldoutGroup("System"), Button(ButtonSizes.Large)]
    void RunSystem()
    {
        var func = m_System?.GetMethod(m_Method,
            BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);

        func?.Invoke(World.DefaultGameObjectInjectionWorld.GetOrCreateSystem(m_System), new object[] { });
    }
        #endif

    #region ============= Database ==============

        public TModel FirstOrDefault(Expression<Func<TModel, bool>> expr = null, Action<TModel> func = null) {
            var ret = Table().FirstOrDefault(expr);
            if (ret.Id == 0 && func != null) {
                func?.Invoke(ret);
                ret._保存表();
            }

            return ret;

            //var query = _db.Table<T>().FirstOrDefault(expr) ?? CreateInstance<T>();
            // var ret = Core.FindOrCreatePreloadAsset<T>();
            // if (query.Id == 0) {
            //     func?.Invoke(expr == null ? ret : query);
            //     _db.Insert(expr == null ? ret : query);
            // }
            // if (expr == null) {
            //     JsonUtility.FromJsonOverwrite(JsonUtility.ToJson(query), ret);
            // }
            // if (ret == null) {
            //     // if (typeof(ScriptableObject).IsAssignableFrom(typeof(T))) {
            //     ret = CreateInstance(typeof(T)) as T;
            //
            //     // } else {
            //     //     ret = new T();
            //     // }
            //     _db.Insert(ret);
            // }
            //
            // // 同步数据库结构
            // _db.CreateTable<T>();
            // _db.GetChildren(ret, true);
            // return ret;
        }

        // [ButtonGroup("Common")]
        // public void _Update()
        // {
        //     //FirstOrDefault();
        //     Updated = Core.TimeStamp();
        //     _db.Update(this);
        //     _db.UpdateWithChildren(this);
        // }

        [ButtonGroup("Common")]
        [FoldoutGroup("base")]
        public void _保存表(bool replace = true) {
            _db.CreateTable<TModel>();
            Updated = Core.TimeStamp();
            if (Id == 0) {
                if (replace)
                    _db.InsertOrReplaceWithChildren(this, true);
                else
                    _db.InsertWithChildren(this);
            }
            else {
                _db.UpdateWithChildren(this);
            }

            //FirstOrDefault();
            // Updated = Core.TimeStamp();
            // _db.InsertOrReplaceWithChildren(this, true);
        }

        public TModel DB_Fetch() {
            _db.GetChildren(this, true);
            return (TModel) this;
        }

        public static TableQuery<TModel> table => instance.Table();

        public TableQuery<TModel> Table() {
            // 同步数据库结构
            _db.CreateTable<TModel>();
            return _db.Table<TModel>();
        }

        public TableQuery<TModel> Where(Expression<Func<TModel, bool>> predExp) {
            return _db.Table<TModel>().Where(predExp);
        }

        // public static T FirstOrDefault(Expression<Func<T, bool>> predExpr) =>
        //     _db.Table<T>().Where(predExpr).FirstOrDefault();

        public void DB_SaveAsDefault() {
            var id = Id;
            Id = 1;
            _保存表();
            Id = id;
        }

        public void DB_Insert(bool replace = true) {
            _db.CreateTable<TModel>();
            if (replace)
                _db.InsertOrReplaceWithChildren(this);
            else
                _db.InsertWithChildren(this);
        }

        public void DB_Delete() {
            _db.Delete(this);
        }

        //[Button]
        //[TitleGroup("Common/Database")]
        // [ ButtonGroup("Common") ]
        // public void Refresh(T obj = null)
        // {
        //     GetType()
        //         .GetProperties()
        //         .ForEach(attr => {
        //             if ( attr.CanWrite ) {
        //                 attr.SetValue(this, attr.GetValue(obj == null ? this : obj,null));
        //             }
        //         });
        // }

        [ButtonGroup("Common")]
        public void _加载表() {
            _db.CreateTable<TModel>();
            var t = _db.Find<TModel>(Id);

            //Debug.Log($"id: {this.Id} data: {JsonUtility.ToJson(t)}");
            if (t != null) JsonUtility.FromJsonOverwrite(JsonUtility.ToJson(t), this);

            //Refresh(t);
        }

        public void DB_LoadWhere(Expression<Func<TModel, bool>> predExp, Action action = null) {
            var tmp = FirstOrDefault(predExp);
            var id = Id;
            DB_LoadDefault(tmp);
            if (id != Id) {
                action?.Invoke();
                _保存表();
            }
        }

        //[Button]
        //[TitleGroup("Common/Database")]
        // public void Save()
        // {
        //     //var tmp = FirstOrDefault() ?? CreateInstance<T>();
        //     //Id = tmp.Id;
        //     Save();
        //     // Refresh();
        // }

        [ButtonGroup("Common")]
        public void _删除表() {
            _db.DropTable<TModel>();
            _db.CreateTable<TModel>();
        }

        public void DB_LoadDefault(TModel tIn) {
            var tInType = tIn.GetType();
            foreach (var itemOut in GetType().GetProperties()) {
                if (!itemOut.CanWrite) continue;

                var itemIn = tInType.GetProperty(itemOut.Name);
                if (itemIn != null) itemOut.SetValue(this, itemIn.GetValue(tIn));
            }

            // this.GetType()
            //     .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            //     .Where(property => property.CanRead) // Not necessary
            //     .ForEach(property => property.SetValue(origin,
            //         origin.GetType().GetProperties().Where(ta => ta == property).Select(tb => tb.GetValue(origin))));
        }

    #endregion

        // public ObjectInitializationData CreateObjectInitializationData()
        // {
        //     m_Instance = m_Instance ??= Core.FindOrCreatePreloadAsset<T>();
        // #if UNITY_EDITOR
        //     if (Application.isEditor) {
        //         return ObjectInitializationData.CreateSerializedInitializationData<T>(typeof(T).Name, m_Instance);
        //     }
        // #endif
        //     return default;
        // }
        //
        // [Ignore]
        // public string Name => typeof(T).Name;
        public void SetInstance(ScriptableObject target) {
            if (target is TModel value) instances[GetType()] = value;
        }
    }
}
