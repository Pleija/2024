using System;
using System.Collections.Generic;
using System.Linq;

public static class Lists
{
    public static T GetFirst<T>(this IEnumerable<T> value) => value.FirstOrDefault();

    public static T Find<T>(this IEnumerable<T> obj, Func<T, bool> func)
    {
        return obj.FirstOrDefault(func);
    }

    public static T Find<T>(this T[] obj, Func<T, bool> func)
    {
        return obj.FirstOrDefault(func);
    }
}