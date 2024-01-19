using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Models;
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
using UnityEngine.Serialization;
using Task = System.Threading.Tasks.Task;

namespace App
{
    [DefaultExecutionOrder(-9000)]
    public class JsMain : Agent<JsMain>
    {
        public UltEvent OnStart;
        public string baseVersion = "1.0.1";

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
        public static bool modelReady;
        public static void ApplicationStart() => ApplicationStart(true).StartStaticCoroutine();

        public static IEnumerator ApplicationStart(bool run)
        {
            needBoot = true;
            yield return Addressables.InitializeAsync();
            var checkForCatalog = Addressables.CheckForCatalogUpdates(false);
            yield return checkForCatalog;
            // while (checkForCatalog.IsValid() && !checkForCatalog.IsDone) {
            //    // Debug.Log($"check for catalog: {checkForCatalog.PercentComplete * 100}%");
            // }

            if (checkForCatalog.Result.Any()) {
                var updateCatalogs = Addressables.UpdateCatalogs(checkForCatalog.Result, false);
                yield return updateCatalogs;
                // while (updateCatalogs.IsValid() && !updateCatalogs.IsDone) {
                //     Debug.Log($"update catalog: {updateCatalogs.PercentComplete * 100}%");
                //     yield return null;
                // }
                var all = updateCatalogs.Result.SelectMany(x =>
                    x.Keys.Select(o => o.ToString()).Where(s => !Guid.TryParse(s, out _))).ToArray();
                Debug.Log($"updated({all.Count()}): {all.JoinStr("\n")}");
                if (updateCatalogs.IsValid()) Addressables.Release(updateCatalogs);
            }
            if (checkForCatalog.IsValid()) Addressables.Release(checkForCatalog);

            if (Res.Exists<GameObject>("JsMain") is { } loc) {
                //yield return Addressables.DownloadDependenciesAsync(loc);
                Addressables.LoadAssetAsync<GameObject>(loc).Completed += h => {
                    if (h.Status == AsyncOperationStatus.Succeeded && h.Result &&
                        h.Result.GetComponentInChildren<JsMain>() is { } instance) {
                        instance.models.Where(x => x).ForEach(x => {
                            ModelBase.Defaults[x.GetType()] = x;
                            x.ResetSelf();
                        });

                        if (Setting.self.ResVersion.Value.CompareVersion(instance.baseVersion) > 0) {
                            modelReady = true;
                            Instantiate(h.Result).OnDestroyRelease(h);
                            self.Reload();
                            return;
                        }
                    }
                    LoadDefault().StartStaticCoroutine();
                };
                yield break;
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

        public static string[] AllMjsProto => Res.ExistsAll<TextAsset>()
            .Where(x => x.PrimaryKey.EndsWith(".mjs") || x.PrimaryKey.EndsWith(".proto")).Select(x => x.PrimaryKey)
            .Distinct().ToArray();

        [FormerlySerializedAs("preload")]
        public List<ModelBase> models = new List<ModelBase>();

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
            var prefab = AssetDatabase.FindAssets("t:GameObject JsMain").FirstOrDefault();

            if (prefab == null) {
                EditorUtility.DisplayDialog("error", "JsMain not found", "ok");
                return false;
            }
            var path = AssetDatabase.GUIDToAssetPath(prefab);

            var go = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            //  var go = Resources.Load<GameObject>("JsMain");
            Assert.IsNotNull(go, $"{path} != null");
            go.GetComponentInChildren<JsMain>().SetupModelPreload();
            PrefabUtility.SavePrefabAsset(go);
            return true;
        }

        //#endif
        [Button]
        public void SetupModelPreload()
        {
            models ??= new List<ModelBase>();
            models.RemoveAll(x => !x);
            AssetDatabase.FindAssets($"t:{typeof(ModelBase).FullName}").Select(x =>
                AssetDatabase.LoadAssetAtPath<ModelBase>(AssetDatabase.GUIDToAssetPath(x))).ForEach(asset => {
                if (models.All(t => t != asset)) {
                    models.Add(asset);
                }
            });
            var files = Directory.GetFiles("Assets/Res/dist/", "*.*", SearchOption.AllDirectories);
            files.Where(x =>
                !File.Exists(x.Replace("Assets/Res/dist/", "Packages/tsproj/src/").Replace(".mjs", ".mts"))).ForEach(
                file => {
                    Debug.Log($"delete: {file}");
                    AssetDatabase.DeleteAsset(file);
                });

            //
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
            Js.Env.ExecuteModule(module.EndsWith(".mjs") ? module : module + ".mjs");
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

            if (!modelReady) {
                modelReady = true;
                models.Where(x => x).ForEach(x => {
                    ModelBase.Defaults[x.GetType()] = x;
                    x.ResetSelf();
                });
            }

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

            foreach (var x in Res.ExistsAll<ModelBase>()) {
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
            if (force && Js._env != null) Js._env.Dispose();
            // if (LoadModels) LoadAll();
            // if (IsGetAssets) GetAssets();
            //Debug.Log(@$"Js Assets: {all.Length} bootstrap: {all.Any(t => t.EndsWith("bootstrap.mjs"))}");
            // if (TryGetType("PuertsStaticWrap.AutoStaticCodeUsing", out var type))
            // Assert.IsNotNull(AutoStaticCodeUsingType, "AutoStaticCodeUsingType != null");
            // AutoStaticCodeUsingType.GetMethod("AutoUsing", BindingFlags.Static | BindingFlags.Public)
            //     ?.Invoke(null, new object[] { JsEnv.self });
            AutoBind?.Invoke(Js.Env);
            Js.Env.UsingAction<Vector2>();
            Js.Env.UsingAction<Vector3>();
            Js.Env.UsingAction<bool>();
            Js.Env.UsingAction<string>();
            Js.Env.UsingAction<float>();
            Js.Env.UsingAction<int>();
            Js.Env.ExecuteModule<Action>("bootstrap.mjs", "Setup")?.Invoke();
        }

        public void Update()
        {
            if (Js._env is { disposed: false })
                Js._env.Tick();
        }

        protected void OnDestroy()
        {
            Js._env?.Dispose();
            // if (JsEnv._env is { isDisposed: false })
            //     JsEnv._env.Dispose();
        }
    }
}
