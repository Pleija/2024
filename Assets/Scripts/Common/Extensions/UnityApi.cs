using System;
using System.Linq;
using System.Security.AccessControl;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public static class UnityApi
{
    public static T IsNull<T>(this T o) where T : UnityEngine.Object => o == null ? null : o;

    public static string GetPath(this GameObject gameObject) => string.Join("/",
        gameObject.GetComponentsInParent<Transform>(true).Select(t => t.name).Reverse().ToArray());

    public static string GetPath(this Component component) => component.gameObject.GetPath();

    public static T Of<T>(this T value, Action<T> fn)
    {
        fn?.Invoke(value);
        return value;
    }

    public static T1 To<T, T1>(this T value, Func<T, T1> fn)
    {
        return fn.Invoke(value);
    }

    public static GameObject OnDestroyRelease(this GameObject go, AsyncOperationHandle<GameObject> handle)
    {
        if(handle.IsValid()) Addressables.Release(handle);
        return go;
    }

    public static GameObject Instantiate(this GameObject go)
    {
        return UnityEngine.Object.Instantiate(go);
    }
}
