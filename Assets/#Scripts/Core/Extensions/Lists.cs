using System;
using System.Collections.Generic;
using System.Linq;
using Puerts;
using Sirenix.Utilities;
using UnityEngine;

public static partial class UnityApi
{
  
    public static IEnumerable<object> ForEach(this IEnumerable<object> source, Action<object> action)
    {
        foreach (var obj in source)
            action(obj);
        return source;
    }


    public static IEnumerable<object> ForEach(this IEnumerable<object> source, Action<object, int> action)
    {
        int num = 0;
        foreach (var obj in source)
            action(obj, num++);
        return source;
    }

    public static List<object> ForEach(this List<object> source, Action<object> action)
    {
        foreach (var obj in source)
            action(obj);
        return source;
    }


    public static List<object> ForEach(this List<object> source, Action<object, int> action)
    {
        int num = 0;
        foreach (var obj in source)
            action(obj, num++);
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

    public static IEnumerable<object> AsWhere(this IEnumerable<object> data, Func<object, bool> cb)
    {
        return data.Where(cb);
    }

    public static object AsFirstOrDefault(this IEnumerable<object> data, Func<object, bool> cb = null)
    {
        return cb != null ? data.FirstOrDefault(cb) : data.FirstOrDefault();
    }

    public static object AsFirst(this IEnumerable<object> data, Func<object, bool> cb = null)
    {
        return cb != null ? data.First(cb) : data.First();
    }

    public static IEnumerable<object> AsForEach(this IEnumerable<object> data, Action<object> cb)
    {
        return data.ForEach(cb);
    }

    public static IEnumerable<object> AsForEach(this IEnumerable<object> source, Action<object, int> action)
    {
        return source.ForEach(action);
    }

    // public static T GetFirst<T>(this IEnumerable<T> value, T _ = default) => value.FirstOrDefault();
    // public static T Find<T>(this IEnumerable<T> obj, Func<T, bool> func, T _ = default) => obj.FirstOrDefault(func);
    // public static T Find<T>(this T[] obj, Func<T, bool> func, T _ = default) => obj.FirstOrDefault(func);
}
