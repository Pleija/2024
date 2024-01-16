using System.Linq;
using UnityEngine;

public static class UnityApi
{
    public static T IsNull<T>(this T o) where T : UnityEngine.Object => o == null ? null : o;

    public static string GetPath(this GameObject gameObject) => string.Join("/",
        gameObject.GetComponentsInParent<Transform>(true).Select(t => t.name).Reverse().ToArray());

    public static string GetPath(this Component component) => component.gameObject.GetPath();
    
}