using System;
using System.Collections.Generic;
using UniRx;
using UniRx.Triggers;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using Object = UnityEngine.Object;

public static class AddressablesHelper
{
    public static WaitUntil Instantiate(this AssetReference asset, Action<GameObject> callback)
    {
        return Instantiate(asset, null, Vector3.zero, Quaternion.identity, callback);
    }

    public static WaitUntil Instantiate(this AssetReference asset, Transform parent, Action<GameObject> callback)
    {
        return Instantiate(asset, parent, Vector3.zero, Quaternion.identity, callback);
    }

    // public static Dictionary<object, AsyncOperationHandle<GameObject>> handles =
    //     new Dictionary<object, AsyncOperationHandle<GameObject>>();

    public static WaitUntil Instantiate(this AssetReference asset, Transform parent, Vector3 position,
        Quaternion rotation, Action<GameObject> callback)
    {
        if (!asset.RuntimeKeyIsValid()) {
            Debug.LogException(new Exception("key error"));
            return new WaitUntil(() => true);
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
        return new WaitUntil(() => h.IsDone);
    }
}
