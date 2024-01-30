using System;
using System.Linq;
using System.Reflection;
using UnityEngine;
using Object = UnityEngine.Object;

namespace Extensions
{
    public static class Objects
    {
        public static Object AsNull(this Object aO) {
            return aO == null ? null : aO;
        }

        public static T Log<T>(this T origin, params object[] others) {
            Debug.Log(others.Prepend(origin).JoinStr());
            return origin;
        }

        public static void TestAllValues(this Array gameObjects) {
            if (gameObjects is GameObject[] value) { }
        }

        public static bool IsNull(this Object o) // 或者名字叫IsDestroyed等等
        {
            return o == null;
        }

        public static T GetInstance<T>(this Object obj) {
            var t = typeof(T);
            if (!t.IsAbstract) {
                var func = t.GetMethod("GetInstance",
                    BindingFlags.Static | BindingFlags.Public | BindingFlags.FlattenHierarchy);

                if (func == null) {
                    Debug.Log($"{t.Name} instance is null");
                    return default;
                }

                return (T) func?.Invoke(null, null);
            }

            return default;
        }

        public static T Tap<T>(this T obj, Action<T> action, Func<T, bool> check = null) {
            if (check == null || check.Invoke(obj)) action?.Invoke(obj);

            return obj;
        }

        public static T Of<T>(this T obj, Action<T> action, Func<T, bool> check = null) {
            if (check == null || check.Invoke(obj)) action?.Invoke(obj);

            return obj;
        }

        public static TResult Tap<T, TResult>(this T obj, Func<T, TResult> action, Func<T, bool> check = null) {
            return action != null && (check == null || check.Invoke(obj)) ? action.Invoke(obj) : default;
        }

        // public static void Bind<T1>(this Component component, ref TextUI<T1> field, TextUI<T1> target)
        //     where T1 : /*IComparable, IConvertible, */IEquatable<T1>
        // {
        //     if(field != null && target != null) {
        //         target.ui = field.ui;
        //     }
        //
        //     if(target?.ui is Text text) {
        //         text.text = $"{target.value}";
        //     } else if(target?.ui is Toggle toggle) {
        //         toggle.isOn = (bool)(object)target.value;
        //     }
        //
        //     field = target;
        // }

        // public static string GetPath(this Transform current)
        // {
        //     if (current?.parent == null) {
        //         return "/" + current?.name;
        //     }
        //
        //     return current.parent.GetPath() + "/" + current.name;
        // }
        //
        // public static string GetPath(this Component component) => component.transform.GetPath() + "/" + component.GetType();

        //public static string GetPath(this GameObject gameObject) => gameObject.transform.GetPath();
    }
}
