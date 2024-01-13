using System;
using System.IO;
using Common;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace App
{
    public class StartUp : Singleton<StartUp>
    {
        // public AssetReference prefab;
        // public GameObject old;
        public bool clearDir = false;
        public bool disableLog = false;

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
            //old.gameObject.SetActive(false);
            //Loading.self.enabled = false;
            await Addressables.InitializeAsync().Task;

            if (Res.Exists("StartContent") is { } loc) {
                Debug.Log("StartContent Found");
                Addressables.InstantiateAsync("StartContent");
            }
            else {
                Debug.Log("Load DefaultLoading");
                Instantiate(Resources.Load("DefaultLoading"));
            }

            // try {
            //     if (Res.Exists<GameObject>(prefab) is { } res) {
            //         Addressables.DownloadDependenciesAsync(prefab).Completed += h => {
            //             if (h.Status == AsyncOperationStatus.Succeeded) {
            //                 Addressables.InstantiateAsync(prefab).Completed += h2 => {
            //                     old.SetActive(false);
            //                 };
            //             }
            //             else {
            //                 Loading.self.enabled = true;
            //             }
            //         };
            //     }
            //     else {
            //         Loading.self.enabled = true;
            //     }
            // }
            // catch (Exception e) {
            //     Debug.LogException(e);
            //     Loading.self.enabled = true;
            // }
        }
    }
}
