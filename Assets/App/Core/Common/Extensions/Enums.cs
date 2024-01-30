using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Runtime.CompilerServices;
using Runtime.Enums;
using UnityEngine;

namespace Runtime.Extensions
{
    public static class Enums
    {
        // 必须存在并且值符合条件
        public static ITuple Is(this Enum e, Func<int, bool> func) {
            return (e, func);
        }

        // 存在时符合, 或者不存在
        public static ITuple IsOrNone(this Enum e, Func<int, bool> func) {
            return (e, func, Id.None);
        }

        // 所有父级
        public static ITuple Parents(this Enum e, params object[] items) {
            return (Id.Parents, e, items);
        }

        // 最近父级
        public static ITuple Parent(this Enum e, params object[] items) {
            return (Id.Parent, e, items);
        }

        // 包含 MonoBehaviour
        public static ITuple Has<T>(this Enum e) where T : Component {
            return (e, typeof(T));
        }

        public static ITuple Has<T1, T2>(this Enum e) where T1 : Component where T2 : Component {
            return (e, typeof(T1), typeof(T2));
        }

        public static ITuple Has<T1, T2, T3>(this Enum e)
            where T1 : Component where T2 : Component where T3 : Component {
            return (e, typeof(T1), typeof(T2), typeof(T3));
        }

        public static ITuple Has<T1, T2, T3, T4>(this Enum e) where T1 : Component
            where T2 : Component
            where T3 : Component
            where T4 : Component {
            return (e, typeof(T1), typeof(T2), typeof(T3), typeof(T4));
        }

        public static ITuple Has<T1, T2, T3, T4, T5>(this Enum e) where T1 : Component
            where T2 : Component
            where T3 : Component
            where T4 : Component
            where T5 : Component {
            return (e, typeof(T1), typeof(T2), typeof(T3), typeof(T4), typeof(T5));
        }

        /// https://stackoverflow.com/questions/105372/how-to-enumerate-an-enum
        /// <summary>
        /// Gets all items for an enum value.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="value">The value.</param>
        /// <returns></returns>
        public static IEnumerable<T> GetAllItems<T>(this Enum value) {
            foreach (var item in Enum.GetValues(typeof(T))) yield return (T) item;
        }

        /// <summary>
        /// Gets all items for an enum type.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="value">The value.</param>
        /// <returns></returns>
        public static IEnumerable<T> GetAllItems<T>() where T : struct {
            foreach (var item in Enum.GetValues(typeof(T))) yield return (T) item;
        }

        /// <summary>
        /// Gets all combined items from an enum value.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="value">The value.</param>
        /// <returns></returns>
        /// <example>
        /// Displays ValueA and ValueB.
        /// <code>
        /// EnumExample dummy = EnumExample.Combi;
        /// foreach (var item in dummy.GetAllSelectedItems<EnumExample>())
        /// {
        ///    Console.WriteLine(item);
        /// }
        /// </code>
        /// </example>
        public static IEnumerable<T> GetAllSelectedItems<T>(this Enum value) {
            var valueAsInt = Convert.ToInt32(value, CultureInfo.InvariantCulture);
            foreach (var item in Enum.GetValues(typeof(T))) {
                var itemAsInt = Convert.ToInt32(item, CultureInfo.InvariantCulture);
                if (itemAsInt == (valueAsInt & itemAsInt)) yield return (T) item;
            }
        }

        /// <summary>
        /// Determines whether the enum value contains a specific value.
        /// </summary>
        /// <param name="value">The value.</param>
        /// <param name="request">The request.</param>
        /// <returns>
        ///     <c>true</c> if value contains the specified value; otherwise, <c>false</c>.
        /// </returns>
        /// <example>
        /// <code>
        /// EnumExample dummy = EnumExample.Combi;
        /// if (dummy.Contains<EnumExample>(EnumExample.ValueA))
        /// {
        ///     Console.WriteLine("dummy contains EnumExample.ValueA");
        /// }
        /// </code>
        /// </example>
        public static bool Contains<T>(this Enum value, T request) {
            var valueAsInt = Convert.ToInt32(value, CultureInfo.InvariantCulture);
            var requestAsInt = Convert.ToInt32(request, CultureInfo.InvariantCulture);
            if (requestAsInt == (valueAsInt & requestAsInt)) return true;

            return false;
        }

        public static string FullName(this Enum myEnum) {
            return $"{myEnum.GetType().Name}.{myEnum}";
        }

        public static string Name(this Enum myEnum) {
            return $"{myEnum}";
        }
        
        /// <summary>
        ///
        ///Getting the value of a custom attribute from an enum
        /// https://codereview.stackexchange.com/questions/5352/getting-the-value-of-a-custom-attribute-from-an-enum
        /// </summary>
        /// <param name="value"></param>
        /// <typeparam name="TAttribute"></typeparam>
        /// <returns></returns>
        
        public static TAttribute GetAttribute<TAttribute>(this Enum value)
            where TAttribute : Attribute
        {
            var type = value.GetType();
            var name = Enum.GetName(type, value);
            return type.GetField(name) // I prefer to get attributes this way
                .GetCustomAttribute<TAttribute>();
        }
        
    }
}
