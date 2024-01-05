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
