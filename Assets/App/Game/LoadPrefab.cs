#region
using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.AddressableAssets;
#endregion

public class LoadPrefab : View<LoadPrefab>
{
    public List<Item> items = new List<Item>();
    public bool LoadOnStart = true;

    public void Start()
    {
        if (LoadOnStart) Load();
    }

    public async void Load()
    {
        foreach (var item in items?.Where(x => x.enable) ?? new List<Item>())
            await Addressables.InstantiateAsync(item.prefab, item.parent).Task;
    }

    [Serializable]
    public class Item
    {
        public bool enable = true;
        public Transform parent;
        public AssetReferenceGameObject prefab;
    }
}
