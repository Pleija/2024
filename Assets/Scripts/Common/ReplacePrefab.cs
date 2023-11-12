using System;
using System.Collections.Generic;
using System.Linq;
using Sirenix.Utilities;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Common
{
    [DefaultExecutionOrder(-9100)]
    public class ReplacePrefab : Agent<ReplacePrefab>
    {
        [Serializable]
        public class Item
        {
            public bool enable = true;
            public GameObject target;
            public AssetReferenceGameObject prefab;
        }

        public List<Item> items;

        public void Awake()
        {
            items ??= new List<Item>();
            //items.RemoveAll(x => !x.enable || !x.target || !x.prefab.IsValid());
            items.Where(x => x.enable).ForEach(x => {
                var origin = x.target.name;
                Debug.Log($"Updating {origin}");
                var parent = x.target.transform.parent;
                var oldName = x.target.name;
                Addressables.InstantiateAsync(x.prefab, parent).Completed += handle => {
                    if(handle.Status == AsyncOperationStatus.Succeeded) {
                        Destroy(x.target);
                        handle.Result.name = oldName;
                        if(handle.Result.transform.Find("OnLoad") is { } onload) {
                            onload.gameObject.SetActive(true);
                        }
                    }
                };

                // Destroy(x.target);
                // Addressables.DownloadDependenciesAsync(x.prefab).Completed += handle => {
                //     Debug.Log($"Updating {name} => {handle.Status}");
                //     Addressables.InstantiateAsync(x.prefab, parent);
                // };
            });
        }
    }
}
