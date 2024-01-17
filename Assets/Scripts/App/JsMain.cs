using System.Collections.Generic;
using System.Linq;
using Puerts;
using PuertsStaticWrap;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UltEvents;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Events;
using UnityEngine.ResourceManagement.AsyncOperations;
using Task = System.Threading.Tasks.Task;

namespace App
{
    [DefaultExecutionOrder(-9000)]
    public class JsMain : Agent<JsMain>
    {
        public static JsMain self;
        // public void OnEnable() { }

        public UltEvent OnStart;
        public static bool assetsReady;

        public static string[] all => Res.Exists<TextAsset>()
            .Where(x => x.PrimaryKey.EndsWith(".mjs") || x.PrimaryKey.EndsWith(".proto")).Select(x => x.PrimaryKey)
            .Distinct().ToArray();

        public static async Task GetAssets()
        {
            ResLoader.assets.Clear();
            // await Addressables.DownloadDependenciesAsync(all.AsEnumerable(), Addressables.MergeMode.Union).Task;

            foreach (var item in all) {
                var path = item.Replace($"{ResLoader.root}/", "").Replace("Assets/Res/proto/", "");
                ResLoader.assets[path] = await Addressables.LoadAssetAsync<TextAsset>(item).Task;
            }
            assetsReady = true;
        }

        public bool updateCatalog = false;

        [SerializeField]
        private bool IsGetAssets;

        public bool LoadModels;

        public void ExecuteModule(string module)
        {
            JsEnv.self.ExecuteModule(module.EndsWith(".mjs") ? module : module + ".mjs");
        }

        public async void Load()
        {
            Debug.Log("Start JsMain");
            self = this;
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
            await Reload();
            OnStart?.Invoke();
            //SceneManager.LoadScene("Start");
        }

        public async Task Reload(bool force = false)
        {
            if (force) JsEnv._env.Dispose();
            //if (LoadModels)
            await ModelBase.LoadAll();
            if (IsGetAssets)
                await GetAssets();
            Debug.Log(@$"Js Assets: {all.Length} bootstrap: {all.Any(t => t.EndsWith("bootstrap.mjs"))}");
            JsEnv.self.AutoUsing();
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

        public void OnDestroy()
        {
            if (JsEnv._env is { isDisposed: false })
                JsEnv._env.Dispose();
        }
    }
}
