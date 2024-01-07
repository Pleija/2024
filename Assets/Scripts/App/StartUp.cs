using System;
using System.IO;
using Common;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace App
{
    public class StartUp : Singleton<StartUp>
    {
        public AssetReference prefab;
        public GameObject old;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void DebugSetting()
        {
            if (Debug.isDebugBuild && !Application.isEditor &&
                PlayerPrefs.GetString(Loading.VersionKey) != Application.version)
                Directory.Delete(Application.persistentDataPath + "/com.unity.addressables", true);

            if (Application.isEditor || Debug.isDebugBuild || PlayerPrefs.HasKey("App.Dev")) {
                //Instantiate(Resources.Load("IngameDebugConsole"));
            }
            else {
                Debug.unityLogger.logEnabled = false;
            }
        }

        private async void Start()
        {
            Debug.Log($"Start Time: {Time.realtimeSinceStartup:F2}");
            Addressables.InitializeAsync().WaitForCompletion();

            try {
                var go = await Addressables.InstantiateAsync(prefab).Task;

                if (!go) {
                    old.SetActive(true);
                }
            }
            catch (Exception e) {
                Debug.LogException(e);
                old.SetActive(true);
            }
        }
    }
}
