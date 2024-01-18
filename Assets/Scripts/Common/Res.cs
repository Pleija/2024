using System;
using System.Collections.Generic;
using System.Linq;
using Cysharp.Threading.Tasks;
using UniRx;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.ResourceManagement.ResourceLocations;

// namespace Common
// {
public static class Res
{
    // public static string[] Keys => ResourceLocators.SelectMany(x => x.Keys).Cast<string>()
    //     .Distinct().ToArray();

    public static IEnumerable<IResourceLocator> ResourceLocators {
        get {
            if (Addressables.ResourceLocators == null || !Addressables.ResourceLocators.Any())
                Addressables.InitializeAsync().WaitForCompletion();
            return Addressables.ResourceLocators;
        }
    }

    public static AsyncOperationHandle<long> GetDownloadSizeAll() => Addressables.GetDownloadSizeAsync(Keys);

    public static AsyncOperationHandle DownloadAll() =>
        Addressables.DownloadDependenciesAsync(Keys, Addressables.MergeMode.Union, false);

    public static IEnumerable<string> Keys => ResourceLocators.SelectMany(x => x.Keys)
        .Select(key => Exists(key.ToString())?.PrimaryKey ?? null).Where(x => x != null).Distinct();

    public static ResourceLocationBase Exists<T>(object key) => Exists(key, typeof(T));

    public static ResourceLocationBase Exists(object key, Type type = null)
    {
        var result = new List<ResourceLocationBase>();
        foreach (var locator in ResourceLocators)
            if (locator.Locate(key is AssetReference reference ? reference.RuntimeKey : $"{key}", type,
                    out var resourceLocations))
                return resourceLocations.First() as ResourceLocationBase;
        return null;
    }

    public static List<ResourceLocationBase> Exists<T>() => Exists(typeof(T));

    public static List<ResourceLocationBase> Exists(Type type)
    {
        var result = new List<ResourceLocationBase>();
        foreach (var locator in ResourceLocators)
        foreach (var key in locator.Keys)
            if (locator.Locate(key, type, out var resourceLocations))
                if (resourceLocations.FirstOrDefault(x => !Guid.TryParse(x.PrimaryKey, out _)) is { } loc)
                    result.Add(loc as ResourceLocationBase);
        return result.Any() ? result : null;
    }

#region AssetReference
    

    public static void Check(this AssetReference assetReference, Action<GameObject> action)
    {
        action.Invoke(null);
    }

    public static UniTask Inst(this AssetReference asset, Action<GameObject> callback) =>
        Inst(asset, null, Vector3.zero, Quaternion.identity, callback);

    public static UniTask Inst(this AssetReference asset, Transform parent, Action<GameObject> callback) =>
        Inst(asset, parent, Vector3.zero, Quaternion.identity, callback);

    public static UniTask LoadPrefab(this AssetReference asset, Action<GameObject> callback)
    {
        return LoadAs(asset, typeof(GameObject), t => callback.Invoke(t as GameObject));
    }

    public static UniTask LoadAs(this AssetReference asset, Type type = null, Action<UnityEngine.Object> callback = null)
    {
        if (!asset.RuntimeKeyIsValid()) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<UnityEngine.Object>(asset);
        h.Completed += handle => {
            if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.GetType() == type) {
                callback?.Invoke(handle.Result);
            }
            else {
                callback?.Invoke(null);
                Addressables.Release(handle);
            }
        };
        return UniTask.WaitUntil(() => h.IsDone);
    }

    public static UniTask Inst(this AssetReference asset, Transform parent, Vector3 position, Quaternion rotation,
        Action<GameObject> callback)
    {
        if (!asset.RuntimeKeyIsValid()) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<GameObject>(asset);
        //Addressables.InstantiateAsync(asset, position, rotation, parent);
        h.Completed += handle => {
            if (handle.Status == AsyncOperationStatus.Succeeded) {
                var go = UnityEngine.Object.Instantiate(handle.Result, position, rotation, parent);
                go.OnDestroyAsObservable().Subscribe(t => {
                    if (handle.IsValid()) Addressables.Release(handle);
                });
                callback?.Invoke(go);
            }
            else {
                callback?.Invoke(null);
                Addressables.Release(handle);
            }
        };
        return UniTask.WaitUntil(() => h.IsDone);
    }
#endregion

#region IResourceLocation
    

    public static void Check(this ResourceLocationBase asset, Action<GameObject> action)
    {
        action.Invoke(null);
    }

    public static UniTask Inst(this ResourceLocationBase asset, Action<GameObject> callback) =>
        Inst(asset, null, Vector3.zero, Quaternion.identity, callback);

    public static UniTask Inst(this ResourceLocationBase asset, Transform parent, Action<GameObject> callback) =>
        Inst(asset, parent, Vector3.zero, Quaternion.identity, callback);

    public static UniTask LoadPrefab(this ResourceLocationBase asset, Action<GameObject> callback)
    {
        return LoadAs(asset, typeof(GameObject), t => callback.Invoke(t as GameObject));
    }

    public static UniTask LoadAs(this ResourceLocationBase asset, Type type = null, Action<UnityEngine.Object> callback = null)
    {
        if (asset == null) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<UnityEngine.Object>(asset);
        h.Completed += handle => {
            if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.GetType() == type) {
                callback?.Invoke(handle.Result);
            }
            else {
                callback?.Invoke(null);
                Addressables.Release(handle);
            }
        };
        return UniTask.WaitUntil(() => h.IsDone);
    }

    public static UniTask Inst(this ResourceLocationBase asset, Transform parent, Vector3 position, Quaternion rotation,
        Action<GameObject> callback)
    {
        if (asset == null) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<GameObject>(asset);
        //Addressables.InstantiateAsync(asset, position, rotation, parent);
        h.Completed += handle => {
            if (handle.Status == AsyncOperationStatus.Succeeded) {
                var go = UnityEngine.Object.Instantiate(handle.Result, position, rotation, parent);
                go.OnDestroyAsObservable().Subscribe(t => {
                    if (handle.IsValid()) Addressables.Release(handle);
                });
                callback?.Invoke(go);
            }
            else {
                callback?.Invoke(null);
                Addressables.Release(handle);
            }
        };
        return UniTask.WaitUntil(() => h.IsDone);
    }
#endregion

}
// }
