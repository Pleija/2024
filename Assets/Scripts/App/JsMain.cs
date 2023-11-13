using System.Collections.Generic;
using System.Linq;
using BetterEvents;
using Common;
using Puerts;
using PuertsStaticWrap;
using SqlCipher4Unity3D;
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

        public UnityEvent OnStart;
        public BetterEvent OnStart2;
        public static bool assetsReady;

        public static async Task GetAssets()
        {
            var all = Res.Exists<TextAsset>()
                .Where(x => x.PrimaryKey.EndsWith(".mjs") || x.PrimaryKey.EndsWith(".proto"))
                .Select(x => x.PrimaryKey).Distinct().ToArray();
            ResLoader.assets.Clear();
            // await Addressables.DownloadDependenciesAsync(all.AsEnumerable(), Addressables.MergeMode.Union).Task;

            foreach(var item in all) {
                var path = item.Replace($"{ResLoader.root}/", "").Replace("Assets/Res/proto/", "");
                ResLoader.assets[path] = await Addressables.LoadAssetAsync<TextAsset>(item).Task;
            }
            assetsReady = true;
        }

        public bool updateCatalog = false;

        [SerializeField]
        private bool IsGetAssets;

        public async void Awake()
        {
            self = this;
            if(transform.parent != null) transform.SetParent(null);
            DontDestroyOnLoad(gameObject);
            await Addressables.InitializeAsync().Task;

            if(updateCatalog) {
                var handle = Addressables.CheckForCatalogUpdates(false);
                await handle.Task;

                if(handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Any()) {
                    await Addressables.UpdateCatalogs(handle.Result).Task;
                }
                Addressables.Release(handle);
            }
            await Model.LoadAll();

            if(IsGetAssets) {
                await GetAssets();
            }
            Debug.Log(@$"Js Assets: {ResLoader.assets.Count()}");
            JsEnv.self.AutoUsing();
            JsEnv.self.ExecuteModule("bootstrap.mjs");
            OnStart?.Invoke();
            OnStart2.Invoke();
            //SceneManager.LoadScene("Start");
        }

        public void Update()
        {
            if(JsEnv._env is { isDisposed: false })
                JsEnv._env.Tick();
        }

        public void OnDestroy()
        {
            JsEnv.self.Dispose();
        }
    }
}
