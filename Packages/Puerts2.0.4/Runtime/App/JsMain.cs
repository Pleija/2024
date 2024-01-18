using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Org.BouncyCastle.Crypto.Engines;
using Puerts;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
using UltEvents;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Assertions;
using UnityEngine.Events;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.SceneManagement;
using Task = System.Threading.Tasks.Task;

namespace App
{
    [DefaultExecutionOrder(-9000)]
    public class JsMain : Agent<JsMain>
    {
        public UltEvent OnStart;

        // public static bool assetsReady;
        private static JsMain m_Instance;

        static IEnumerator LoadDefault()
        {
            var handle = Resources.LoadAsync<GameObject>("DefaultLoading");
            yield return handle;
            Instantiate(handle.asset);
            self.Reload();
        }

        public static bool needBoot;

        public static void ApplicationStart()
        {
            needBoot = true;

            if (Res.Exists<GameObject>("JsMain") is { } loc) {
                Addressables.LoadAssetAsync<GameObject>(loc).Completed += h => {
                    if (h.Status == AsyncOperationStatus.Succeeded && h.Result) {
                        Instantiate(h.Result).OnDestroyRelease(h);
                        self.Reload();
                    }
                    else {
                        LoadDefault().StartStaticCoroutine();
                    }
                };
                return;
            }
            LoadDefault().StartStaticCoroutine();
        }

        public static JsMain self {
            get {
                if (isQuit) return m_Instance;
                m_Instance ??= FindObjectOfType<JsMain>(true);
                if (m_Instance) return m_Instance;
                Instantiate(Resources.Load<GameObject>("DefaultLoading"));

                // var go = Instantiate(Addressables.LoadAssetAsync<GameObject>("JsMain").WaitForCompletion());
                // m_Instance ??= go.GetComponent<JsMain>();

                // if (!Application.isPlaying) {
                //     go.hideFlags = HideFlags.HideAndDontSave;
                // }
                return m_Instance;
            }
        }

        public static string[] all => Res.Exists<TextAsset>()
            .Where(x => x.PrimaryKey.EndsWith(".mjs") || x.PrimaryKey.EndsWith(".proto")).Select(x => x.PrimaryKey)
            .Distinct().ToArray();

        public List<ScriptableObject> preload = new List<ScriptableObject>();

        [Serializable]
        public class Item
        {
            public string path;
            public TextAsset file;
        }

        public List<Item> scripts = new List<Item>();
        //#if UNITY_EDITOR
#if UNITY_EDITOR
        [InitializeOnEnterPlayMode]
        static void Preset() => PressPreload();

        public static bool PressPreload()
        {
            var prefab = AssetDatabase.FindAssets("JsMain").FirstOrDefault();

            if (prefab == null) {
                EditorUtility.DisplayDialog("error", "JsMain not found", "ok");
                return false;
            }
            var path = AssetDatabase.GUIDToAssetPath(prefab);
            var go = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            //  var go = Resources.Load<GameObject>("JsMain");
            go.GetComponentInChildren<JsMain>().SetupModelPreload();
            PrefabUtility.SavePrefabAsset(go);
            return true;
        }

        //#endif
        [Button]
        public void SetupModelPreload()
        {
            preload ??= new List<ScriptableObject>();
            preload.RemoveAll(x => !x);
            AssetDatabase.FindAssets($"t:{typeof(ModelBase).FullName}").Select(x =>
                AssetDatabase.LoadAssetAtPath<ScriptableObject>(AssetDatabase.GUIDToAssetPath(x))).ForEach(asset => {
                if (preload.All(t => t != asset)) {
                    preload.Add(asset);
                }
            });
            var assets = AssetDatabase.FindAssets($"t:TextAsset").Select(AssetDatabase.GUIDToAssetPath)
                .Where(t => t.EndsWith(".mjs") || t.EndsWith(".proto")).ToArray();
            //Debug.Log(AssetDatabase.LoadAssetAtPath<Object>(all.FirstOrDefault()) ?.GetType().GetNiceName());
            scripts = assets.Where(x => x.StartsWith("Assets/Res/")).Select(x => new Item() {
                path = x, file = AssetDatabase.LoadAssetAtPath<TextAsset>(x)
            }).ToList();
            Debug.Log($"all: {assets.Count()} scripts: {scripts.Count}");
            //var t = AssetDatabase.LoadAssetAtPath<Object>("Assets/Res/dist/bootstrap.mjs");
            //Debug.Log(t.GetType().GetNiceName());
        }
#endif

        public static void GetAssets()
        {
            // ResLoader.assets.Clear();
            // // await Addressables.DownloadDependenciesAsync(all.AsEnumerable(), Addressables.MergeMode.Union).Task;
            //
            // foreach (var item in all) {
            //     var path = item.Replace($"{ResLoader.root}/", "").Replace("Assets/Res/proto/", "");
            //     ResLoader.assets[path] = Addressables.LoadAssetAsync<TextAsset>(item).WaitForCompletion();
            // }
            // assetsReady = true;
        }

        public bool updateCatalog = false;

        [SerializeField]
        private bool IsGetAssets;

        public bool LoadModels;

        public void ExecuteModule(string module)
        {
            JsEnv.self.ExecuteModule(module.EndsWith(".mjs") ? module : module + ".mjs");
        }

        public static bool isQuit;
        private static bool initialed;

        private void Awake()
        {
            if (m_Instance) {
                Destroy(gameObject);
                return;
            }
            Debug.Log("Start JsMain");
            m_Instance = this;

            if (!initialed) {
                Application.quitting += () => isQuit = true;
                initialed = true;
            }
            if (transform.parent != null) transform.SetParent(null);
            DontDestroyOnLoad(gameObject);
        }

        public async void Load()
        {
            Debug.Log("Start JsMain");
            if (transform.parent != null) transform.SetParent(null);
            DontDestroyOnLoad(gameObject);
            if (!Addressables.ResourceLocators.Any())
                Addressables.InitializeAsync().WaitForCompletion();

            if (updateCatalog) {
                var handle = Addressables.CheckForCatalogUpdates(false);
                await handle.Task;
                if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Any())
                    await Addressables.UpdateCatalogs(handle.Result).Task;
                Addressables.Release(handle);
            }
            Reload();
            OnStart?.Invoke();
            //SceneManager.LoadScene("Start");
        }

        public static bool TryGetType(string fullname, out Type result)
        {
            result = FindTypes(t => t == fullname).FirstOrDefault();
            return result != null;
        }

        public static IEnumerable<Type> FindTypes(Func<string, bool> predicate)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies()) {
                if (!assembly.IsDynamic) {
                    Type[] exportedTypes = null;

                    try {
                        exportedTypes = assembly.GetExportedTypes();
                    }
                    catch (ReflectionTypeLoadException e) {
                        exportedTypes = e.Types;
                    }

                    if (exportedTypes != null) {
                        foreach (var type in exportedTypes) {
                            if (predicate(type.FullName))
                                yield return type;
                        }
                    }
                }
            }
        }

        public static void LoadAll()
        {
            var types = new List<string>();

            foreach (var x in Res.Exists<ModelBase>()) {
                // await Addressables.DownloadDependenciesAsync(x).Task;
                //if (Defaults.ContainsKey(x.ResourceType)) continue;
                types.Add($"{x.ResourceType.FullName} => {x.PrimaryKey}");
                ModelBase.Defaults[x.ResourceType] = Addressables.LoadAssetAsync<ModelBase>(x).WaitForCompletion();
            }
            Debug.Log($"all models: {string.Join(", ", types)}");
        }

        // [SerializeField, ReadOnly]
        // private string typeName;
        //
        // [ShowInInspector]
        // public Type AutoStaticCodeUsingType {
        //     get => Type.GetType(typeName);
        //     set => typeName = value.AssemblyQualifiedName;
        // }

        public static Action<JsEnv> AutoBind;

        public void Reload(bool force = false)
        {
            if (force && JsEnv._env != null) JsEnv._env.Dispose();
            // if (LoadModels) LoadAll();
            // if (IsGetAssets) GetAssets();
            //Debug.Log(@$"Js Assets: {all.Length} bootstrap: {all.Any(t => t.EndsWith("bootstrap.mjs"))}");
            // if (TryGetType("PuertsStaticWrap.AutoStaticCodeUsing", out var type))
            // Assert.IsNotNull(AutoStaticCodeUsingType, "AutoStaticCodeUsingType != null");
            // AutoStaticCodeUsingType.GetMethod("AutoUsing", BindingFlags.Static | BindingFlags.Public)
            //     ?.Invoke(null, new object[] { JsEnv.self });
            AutoBind?.Invoke(JsEnv.self);
            JsEnv.self.UsingAction<Vector2>();
            JsEnv.self.UsingAction<Vector3>();
            JsEnv.self.UsingAction<bool>();
            JsEnv.self.UsingAction<string>();
            JsEnv.self.UsingAction<float>();
            JsEnv.self.UsingAction<int>();
            JsEnv.self.ExecuteModule("bootstrap.mjs");
        }

        public void Update()
        {
            if (JsEnv._env is { isDisposed: false })
                JsEnv._env.Tick();
        }

        protected void OnDestroy()
        {
            JsEnv._env?.Dispose();
            // if (JsEnv._env is { isDisposed: false })
            //     JsEnv._env.Dispose();
        }
    }
}
