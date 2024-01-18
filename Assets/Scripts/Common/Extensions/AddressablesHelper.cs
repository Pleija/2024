using System;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UniRx;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using Object = UnityEngine.Object;

public static class AddressablesHelper
{
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

    public static UniTask LoadAs(this AssetReference asset, Type type = null, Action<Object> callback = null)
    {
        if (!asset.RuntimeKeyIsValid()) {
            Debug.LogException(new Exception("key error"));
            return UniTask.WaitUntil(() => true);
        }
        var h = Addressables.LoadAssetAsync<Object>(asset);
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
                var go = Object.Instantiate(handle.Result, position, rotation, parent);
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
}
