#region
#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
#endif
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Puerts;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using Zu.TypeScript.TsTypes;
using Object = UnityEngine.Object;
using Type = System.Type;
#endregion

public static partial class UnityApi
{
    public static void Log(this JSObject jsObject)
    {
        Debug.Log(jsObject.Safe);
    }

    public static Object ToNull(this Object obj) => obj ? obj : null;
    public static Object AsNull(this Object obj) => obj ? obj : null;
    public static bool IsNull(this Object obj) => obj;
    public static List<object> ToList(this JSObject obj) => null;
    public static object ToAny(this JSObject obj) => null;
    public static object ToObject(this JSObject obj) => null;
    public static HashSet<object> ToHashSet(this JSObject obj) => null;
    public static object[] ToArray(this JSObject obj) => null;
    public static Dictionary<object, object> ToDictionary(this JSObject obj) => null;
    public static JSObject ToMap(this Dictionary<object, object> dictionary) => null;
    public static JSObject ToArray(this Dictionary<object, object> dictionary) => null;

    public static IList CreateList(this Type type, params object[] args)
    {
        var listType = typeof(List<>);
        var constructedListType = listType.MakeGenericType(type);
        var instance = (IList)Activator.CreateInstance(constructedListType);
        args.ForEach(t => instance.Add(t));
        return instance;
    }

    public static IDictionary CreateDictionary(this Type keyType, Type valueType,
        Action<IDictionary> callback = null)
    {
        var dictToCreate = typeof(Dictionary<,>).MakeGenericType(keyType, valueType);
        var ret = (IDictionary)Activator.CreateInstance(dictToCreate);
        callback?.Invoke(ret);
        return ret;
    }

    public static Array CreateArray(this Type type, params object[] args)
    {
        var ret = Array.CreateInstance(type, args.Length);
        args.ForEach((t, i) => ret.SetValue(t, i));
        return ret;
    }

    public static void DontDestroyOnLoad(this GameObject gameObject)
    {
        if (gameObject.transform.parent != null) gameObject.transform.SetParent(null);
        Object.DontDestroyOnLoad(gameObject);
    }

    // public static object where<T, T2>(this T value, Func<T2, bool> func) where T : IEnumerable
    // {
    //     return null;
    // }

    public static T HasComponent<T>(this GameObject gameObject) where T : Component =>
            gameObject.TryGetComponent(typeof(T), out var ret) ? ret as T : null;

    public static Component HasComponent(this GameObject gameObject, Type type) =>
            gameObject.TryGetComponent(type, out var ret) ? ret : null;

    public static T HasComponent<T>(this Component component) where T : Component =>
            component.TryGetComponent(typeof(T), out var ret) ? ret as T : null;

    public static Component HasComponent(this Component component, Type type) =>
            component.TryGetComponent(type, out var ret) ? ret : null;

    public static void ForEach(this Transform transform, Action<Transform> action)
    {
        //transform.name
        if (!transform || action == null) return;
        foreach (Transform child in transform) action.Invoke(child);
    }

    public static void ForEach(this Transform transform, Action<Transform, int> action)
    {
        if (!transform || action == null) return;
        for (var i = 0; i < transform.childCount; i++) action.Invoke(transform.GetChild(i), i);
    }

    public static IEnumerable<Transform> Children(this Component component,
        Func<Transform, bool> filter = null) =>
            component.transform.Cast<Transform>().Where(filter ?? (t => true));

    public static IEnumerable<Transform> Children(this GameObject gameObject,
        Func<Transform, bool> filter = null) =>
            gameObject.transform.Cast<Transform>().Where(filter ?? (t => true));

    public static Component RequireComponent(this Component component, Type type) =>
            component.TryGetComponent(type, out var ret) ? ret
                    : component.gameObject.AddComponent(type);

    public static T RequireComponent<T>(this Component component) where T : Component =>
            component.RequireComponent(typeof(T)) as T;

    public static Component RequireComponent(this GameObject gameObject, Type type) =>
            gameObject.TryGetComponent(type, out var ret) ? ret
                    : gameObject.gameObject.AddComponent(type);

    public static T RequireComponent<T>(this GameObject gameObject) where T : Component =>
            gameObject.RequireComponent(typeof(T)) as T;

    public static bool RemoveComponent<T>(this GameObject value) where T : Component =>
            RemoveComponent(value, typeof(T));

    public static bool RemoveComponent<T>(this Component value) where T : Component =>
            RemoveComponent(value ? value.gameObject : null, typeof(T));

    public static bool RemoveComponent(this Component value, Type type) =>
            RemoveComponent(value ? value.gameObject : null, type);

    public static bool RemoveComponent(this GameObject value, Type type)
    {
        if (value && value.HasComponent(type) is { } component) {
            var scene = component.gameObject.scene;
            if (Application.isPlaying)
                Object.Destroy(component);
            else
                Object.DestroyImmediate(component);
#if UNITY_EDITOR
            if (scene != default) EditorSceneManager.MarkSceneDirty(scene);
#endif
            return true;
        }
        return false;
    }

    public static bool DestroySelf(this Object value)
    {
        if (!value) return false;
        var scene = value is Component component ? component.gameObject.scene :
                value is GameObject gameObject ? gameObject.scene : default;
        if (Application.isPlaying)
            Object.Destroy(value);
        else
            Object.DestroyImmediate(value);
#if UNITY_EDITOR
        if (scene != default) EditorSceneManager.MarkSceneDirty(scene);
#endif
        return true;
    }

    public static Color ToColor(this string hexString) =>
            ColorUtility.TryParseHtmlString(hexString, out var color) ? color : Color.white;

    public static void LogDetail(this Node node)
    {
        node.Children.ForEach(x => {
            Debug.Log($"{x.IdentifierStr} => {x.Kind} => {x.GetText()}");
        });
    }

    public static string VersionAdd(this string value, int number = 1)
    {
        var version = value.Split('.');
        version[version.Length - 1] =
                ((int.TryParse(version[version.Length - 1], out var v) ? v : 0) + number)
                .ToString();
        return string.Join(".", version);
    }

    public static int CompareVersion(this string current, string old) =>
            new Version(current).CompareTo(new Version(old));

    public static string JoinStr<T>(this IEnumerable<T> target, string s = ", ") =>
            string.Join(s, target);

    public static string RegexReplace(this string input, string rule, string to) =>
            Regex.Replace(input, rule, to);

    public static T Null<T>(this T o) where T : Object => o == null ? null : o;
    public static bool IsNull<T>(this T o) where T : Object => o == null;
    public static GameObject Null(this GameObject o) => o == null ? null : o;
    public static bool IsNull(this Component o) => o == null;
    public static ScriptableObject Null(this ScriptableObject o) => o == null ? null : o;
    public static bool IsNull(this ScriptableObject o) => o == null;
    public static AssetReference Null(this AssetReference o) => o == null ? null : o;
    public static bool IsNull(this AssetReference o) => o == null;

    public static string GetPath(this GameObject gameObject) => string.Join("/",
        gameObject.GetComponentsInParent<Transform>(true).Select(t => t.name).Reverse().ToArray());

    public static string GetPath(this Component component) => component.gameObject.GetPath();

    public static T Of<T>(this T value, Action<T> fn)
    {
        fn?.Invoke(value);
        return value;
    }

    public static bool If<T>(this T value, Func<T, bool> test, Action<T> fn)
    {
        if (test?.Invoke(value) == true) {
            fn?.Invoke(value);
            return true;
        }
        return false;
    }

    public static bool If<T>(this T value, bool test, Action<T> fn)
    {
        if (test) {
            fn?.Invoke(value);
            return true;
        }
        return false;
    }

    public static T1 As<T, T1>(this T value, Func<T, T1> fn) => fn.Invoke(value);

    public static GameObject OnDestroyRelease(this GameObject go,
        AsyncOperationHandle<GameObject> handle)
    {
        if (handle.IsValid()) Addressables.Release(handle);
        return go;
    }

    public static GameObject Instantiate(this GameObject go) => Object.Instantiate(go);
#if UNITY_EDITOR
    public static string GuidToAssetPath(this string guid) => AssetDatabase.GUIDToAssetPath(guid);

    public static T LoadAssetFromGuid<T>(this string guid) where T : Object =>
            guid.GuidToAssetPath().LoadAssetAtPath<T>();

    public static T LoadAssetAtPath<T>(this string path) where T : Object =>
            AssetDatabase.LoadAssetAtPath<T>(path);

    public static string FullPathToAssetPath(this string path) =>
            path.Replace(Directory.GetCurrentDirectory() + "/", "");

    public static string GetAssetPath(this Object asset) => AssetDatabase.GetAssetPath(asset);
    public static string MakeDir(this string path)
    {
        var dir = !Path.HasExtension(path) ? path : Path.GetDirectoryName(path)!;

        if (!Directory.Exists(dir)) {
            Directory.CreateDirectory(dir);
            AssetDatabase.ImportAsset(dir);
        }
        return path;
    }
#endif
}
