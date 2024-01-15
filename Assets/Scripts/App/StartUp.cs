using System;
using System.IO;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace App
{
    public class StartUp : Singleton<StartUp>
    {
        public bool clearDir = false;
        public bool disableLog = false;
        private bool useRemote => true;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void DebugSetting()
        {
            if (StartUp.self == null) return;
            if (StartUp.self.clearDir && Debug.isDebugBuild && !Application.isEditor &&
                PlayerPrefs.GetString(Loading.VersionKey) != Application.version)
                Directory.Delete(Application.persistentDataPath + "/com.unity.addressables", true);

            if (Application.isEditor || Debug.isDebugBuild || PlayerPrefs.HasKey("App.Dev")) {
                //Instantiate(Resources.Load("IngameDebugConsole"));
            }
            else if (StartUp.self.disableLog) {
                Debug.unityLogger.logEnabled = false;
            }
        }

        private async void Awake()
        {
            Debug.Log($"Initial Time: {Time.realtimeSinceStartup:F2}");
            await Addressables.InitializeAsync().Task;

            if (useRemote && Res.Exists("StartContent") is { } loc) {
                Debug.Log("StartContent Found");
                handle = Addressables.LoadAssetAsync<GameObject>(loc);
                var prefab = await handle.Task;
                var go = prefab != null ? Instantiate(prefab) : null;
                if (go != null) return;
            }
            Debug.Log("Load DefaultLoading");
            Instantiate(Resources.Load("DefaultLoading"));
        }

        protected override void OnDestroy()
        {
            if (handle.IsValid()) Addressables.Release(handle);
            base.OnDestroy();
        }

        public AsyncOperationHandle<GameObject> handle { get; set; }
    }
}
