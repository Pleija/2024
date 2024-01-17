using System;
using System.IO;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace App
{
    public class StartUp : Singleton<StartUp>
    {
        public bool clearDir = false;
        public bool disableLog = false;
        public bool useRemote = true;
        public AssetReferenceGameObject prefab;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void DebugSetting()
        {
            if (self == null) return;
            if (self.clearDir && Debug.isDebugBuild && !Application.isEditor &&
                PlayerPrefs.GetString(Loading.VersionKey) != Application.version)
                Directory.Delete(Application.persistentDataPath + "/com.unity.addressables", true);

            if (Application.isEditor || Debug.isDebugBuild || PlayerPrefs.HasKey("App.Dev")) {
                //Instantiate(Resources.Load("IngameDebugConsole"));
            }

            if (self.disableLog && !(Debug.isDebugBuild || Application.isEditor)) {
                Debug.unityLogger.logEnabled = false;
            }
        }

        public async void OnStart()
        {
            Debug.Log($"Initial Time: {Time.realtimeSinceStartup:F2}");
            await Addressables.InitializeAsync().Task;

            if (useRemote && Res.Exists(prefab/*"StartContent"*/) is { } loc) {
                Debug.Log("StartContent Found");
                var handle = Addressables.LoadAssetAsync<GameObject>(loc);
                var temp = await handle.Task;

                if (temp != null && Instantiate(temp) is { } go) {
                    go.OnDestroyAsObservable().Subscribe(() => {
                        if (handle.IsValid()) Addressables.Release(handle);
                    });
                    return;
                }

                if (handle.IsValid()) {
                    Addressables.Release(handle);
                }
            }
            Debug.Log("Load DefaultLoading");
            Instantiate(Resources.Load("DefaultLoading"));
        }
    }
}
