using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Runtime.Extensions
{
    public static class Tuples
    {
//        public static IEnumerable GetEnumerator(this ITuple tuple)
//        {
//            return tuple.GetType().GetProperties().Select(property => property.GetValue(tuple));
//        }

        public static List<T> ToList<T>(this ITuple aTuple) {
            return ToList(aTuple).Cast<T>().ToList();
        }

        public static List<object> ToList(this ITuple tuple) {
            var result = new List<object>(tuple.Length);
            for (var i = 0; i < tuple.Length; i++) result.Add(tuple[i]);
            return result;
        }

        public static ITuple ForEach(this ITuple aTuple, Action<object> aAction) {
            if (aTuple == default) return null;

            foreach (var o in aTuple.GetType().GetFields()) // Explicitly get the IEnumerable
                aAction?.Invoke(o.GetValue(aTuple));

            return aTuple;
        }

        public static ITuple ForEach(this ITuple aTuple, Action<object, string> aAction) {
            if (aTuple == default) return null;

            var list = aTuple.GetType().GetFields();
            foreach (var tInfo in list) aAction?.Invoke(tInfo.GetValue(aTuple), tInfo.Name);

            return aTuple;
        }

        public static ITuple ForEach(this ITuple aTuple, Action<object, string, Type> aAction) {
            if (aTuple == default) return null;

            var list = aTuple.GetType().GetFields();
            foreach (var tInfo in list) aAction?.Invoke(tInfo.GetValue(aTuple), tInfo.Name, tInfo.FieldType);

            return aTuple;
        }

//        public static T First<T>(this ITuple tuple, T value = default, params object[] param)
//        {
//            return default;
//        }
//
//        public static T ForEach<T>(this ITuple tuple, T value = default, params object[] param)
//        {
//            return default;
//        }
//
//        public static T Where<T>(this ITuple tuple, T value = default, params object[] param)
//        {
//            return default;
//        }
    }
}
