using System;
using Common;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace App
{
    public class StartUp : Singleton<StartUp>
    {
        public AssetReference prefab;
        public GameObject old;

        private void Start()
        {
            Debug.Log($"Start Time: {Time.realtimeSinceStartup:F2}");
            Addressables.InitializeAsync().WaitForCompletion();

            try {
                Addressables.InstantiateAsync(prefab);
            }
            catch (Exception e) {
                Debug.LogException(e);
                old.SetActive(true);
            }
        }
    }
}
