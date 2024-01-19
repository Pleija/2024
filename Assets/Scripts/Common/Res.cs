using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App;
using Cysharp.Threading.Tasks;
using UniRx;
using UniRx.Triggers;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.ResourceManagement.ResourceLocations;
using UnityEngine.SceneManagement;

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

    public static IResourceLocation Exists<T>(object key) => Exists(key, typeof(T));

    public static IResourceLocation Exists(object key, Type type = null)
    {
        var result = new List<IResourceLocator>();
        foreach (var locator in ResourceLocators)
            if (locator.Locate(key is AssetReference reference ? reference.RuntimeKey : $"{key}", type,
                    out var resourceLocations))
                return resourceLocations.First();
        return null;
    }

    public static List<IResourceLocation> ExistsAll<T>() => ExistsAll(typeof(T));
    public static IResourceLocation Exists(Type type) => ExistsAll(type).FirstOrDefault();
    public static IResourceLocation Exists<T>() => ExistsAll(typeof(T)).FirstOrDefault();

    public static List<IResourceLocation> ExistsAll(Type type)
    {
        var result = new List<IResourceLocation>();
        foreach (var locator in ResourceLocators)
        foreach (var key in locator.Keys)
            if (locator.Locate(key, type, out var resourceLocations))
                if (resourceLocations.FirstOrDefault(x => !Guid.TryParse(x.PrimaryKey, out _)) is { } loc)
                    result.Add(loc);
        return result.Any() ? result : null;
    }

    public static async UniTask LoadScene(string aName, LoadSceneMode mode = LoadSceneMode.Single)
    {
        //SceneManager.LoadScene(aName);
        if (Application.isEditor) {
#if UNITY_EDITOR
            var p1 = EditorSceneManager.LoadSceneAsyncInPlayMode($"Assets/Scenes/{aName}.unity",
                new LoadSceneParameters() { loadSceneMode = mode });
#endif
            return;
        }

        if (Debug.isDebugBuild) {
            var handle = Addressables.CheckForCatalogUpdates(false);
            await handle.Task;

            if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Any()) {
                Debug.Log("Catalog updating");
                await Addressables.UpdateCatalogs(handle.Result).Task;
            }
            if (handle.IsValid()) Addressables.Release(handle);
        }
        await Addressables.DownloadDependenciesAsync(aName).Task;
        JsMain.self.Reload(true);
        Addressables.LoadSceneAsync(aName, mode);
    }

#region AssetReference
    public static void Check(this object assetReference, Action<GameObject> action)
    {
        action.Invoke(null);
    }

    public static UniTask Inst(this object asset, Action<GameObject> callback) =>
        Inst(asset, null, Vector3.zero, Quaternion.identity, callback);

    public static UniTask Inst(this object asset, Transform parent, Action<GameObject> callback) =>
        Inst(asset, parent, Vector3.zero, Quaternion.identity, callback);

    public static UniTask LoadPrefab(this object asset, Action<GameObject> callback)
    {
        return LoadAs(asset, typeof(GameObject), t => callback.Invoke(t as GameObject));
    }

    public static UniTask LoadAs(this object asset, Type type = null, Action<UnityEngine.Object> callback = null)
    {
        var key = asset is IResourceLocation location ? location.PrimaryKey : asset;

        if ((asset is AssetReference assetReference) && !assetReference.RuntimeKeyIsValid() ||
            (asset is IResourceLocation { PrimaryKey: "" })) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<UnityEngine.Object>(key);
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

    public static UniTask Inst(this object asset, Transform parent, Vector3 position, Quaternion rotation,
        Action<GameObject> callback)
    {
        var key = asset is IResourceLocation location ? location.PrimaryKey : asset;
        if ((asset is AssetReference assetReference) && !assetReference.RuntimeKeyIsValid() ||
            (asset is IResourceLocation { PrimaryKey: "" })) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<GameObject>(key);
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
