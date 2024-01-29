#region
using System;
using System.Collections.Generic;
using System.Linq;
#endregion

public static partial class UnityApi
{

    public static U TryGetOrAdd<T, U>(this IDictionary<T, U> dict, T key, Func<T,U> func)
    {
        if (!dict.TryGetValue(key, out var ret)) {
            return dict[key] = func.Invoke(key);
        }
        return ret;
    }
    public static IEnumerable<object> forEach(this IEnumerable<object> source,
        Action<object> action)
    {
        foreach (var obj in source) action(obj);
        return source;
    }

    public static IEnumerable<object> forEach(this IEnumerable<object> source,
        Action<object, int> action)
    {
        var num = 0;
        foreach (var obj in source) action(obj, num++);
        return source;
    }

    public static List<object> forEach(this List<object> source, Action<object> action)
    {
        foreach (var obj in source) action(obj);
        return source;
    }

    public static List<object> forEach(this List<object> source, Action<object, int> action)
    {
        var num = 0;
        foreach (var obj in source) action(obj, num++);
        return source;
    }

    /*
    public static string[] Keys(this JSObject jsObject)
    {
        var keys = new List<string>();
        Js.Env.Eval<Action<object, Action<string>>>("(o,fn) => Object.keys(o).map(fn)")
            .Invoke(jsObject, t => keys.Add(t));
        return keys.ToArray();
    }

    public static void Log(JSObject jsObject)
    {
        Debug.Log(jsObject);
    }

    public static Dictionary<string, object> Map(this JSObject jsObject) => Map<object>(jsObject);

    public static Dictionary<string, T> Map<T>(this JSObject jsObject)
    {
        return jsObject.Keys().ToDictionary(t => t, jsObject.Get<T>);
    }

*/
    // public static IEnumerable<T> AsWhere<T>(this IEnumerable<T> data, Func<T, bool> cb, T _ = default)
    // {
    //     return data.Where(cb);
    // }
    //
    // public static T AsFirstOrDefault<T>(this IEnumerable<T> data, Func<T, bool> cb, T _ = default)
    // {
    //     return data.FirstOrDefault(cb);
    // }
    //
    // public static T AsFirst<T>(this IEnumerable<T> data, Func<T, bool> cb, T _ = default)
    // {
    //     return data.First(cb);
    // }
    //
    //
    // public static IEnumerable<T> AsForEach<T>(this IEnumerable<T> data, Action<T> cb, T _ = default)
    // {
    //     return data.ForEach(cb);
    // }
    //
    // public static IEnumerable<T> AsForEach<T>(this IEnumerable<T> source, Action<T, int> action, T _ = default)
    // {
    //     return source.ForEach(action);
    // }
    public static IEnumerable<object>
            asWhere(this IEnumerable<object> data, Func<object, bool> cb) => data.Where(cb);

    public static object asFirstOrDefault(this IEnumerable<object> data,
        Func<object, bool> cb = null) =>
            cb != null ? data.FirstOrDefault(cb) : data.FirstOrDefault();

    public static object asFirst(this IEnumerable<object> data, Func<object, bool> cb = null) =>
            cb != null ? data.First(cb) : data.First();

    public static IEnumerable<object> asForEach(this IEnumerable<object> data, Action<object> cb) =>
            data.forEach(cb);

    public static IEnumerable<object> asForEach(this IEnumerable<object> source,
        Action<object, int> action) => source.forEach(action);

    // public static T GetFirst<T>(this IEnumerable<T> value, T _ = default) => value.FirstOrDefault();
    // public static T Find<T>(this IEnumerable<T> obj, Func<T, bool> func, T _ = default) => obj.FirstOrDefault(func);
    // public static T Find<T>(this T[] obj, Func<T, bool> func, T _ = default) => obj.FirstOrDefault(func);
}
