using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using Zu.TypeScript.TsTypes;

public static class UnityApi
{
    public static Color ToColor(this string hexString)
    {
        return ColorUtility.TryParseHtmlString(hexString, out var color) ? color : Color.white;
    }

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
            ((int.TryParse(version[version.Length - 1], out var v) ? v : 0) + number).ToString();
        return string.Join(".", version);
    }

    public static int CompareVersion(this string current, string old)
    {
        return new Version(current).CompareTo(new Version(old));
    }

    public static string JoinStr<T>(this IEnumerable<T> target, string s = ", ") => string.Join(s, target);
    public static string RegexReplace(this string input, string rule, string to) => Regex.Replace(input, rule, to);
    public static T Null<T>(this T o) where T : UnityEngine.Object => o == null ? null : o;
    public static bool IsNull<T>(this T o) where T : UnityEngine.Object => o == null;
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

    public static T1 To<T, T1>(this T value, Func<T, T1> fn) => fn.Invoke(value);

    public static GameObject OnDestroyRelease(this GameObject go, AsyncOperationHandle<GameObject> handle)
    {
        if (handle.IsValid()) Addressables.Release(handle);
        return go;
    }

    public static GameObject Instantiate(this GameObject go) => UnityEngine.Object.Instantiate(go);
}
