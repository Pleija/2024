using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using Sirenix.Utilities;

namespace Extensions
{
    public static class Lists
    {
        /// <summary>
        /// Adds the elements of the specified collection to the end of the IList&lt;T&gt;.
        /// </summary>
        public static IEnumerable<T> Add<T>(this IList<T> list, params T[] collection) {
            if (list is List<T>) {
                ((List<T>) list).AddRange(collection);
            }
            else {
                var tmp = list.ToList();
                foreach (var obj in collection) tmp.Add(obj);

                list = tmp;
            }

            return list;
        }

        public static void Add<T>(this List<string> list) {
            list.Add(typeof(T).Name);
        }

        //public static void ForEach<T>(this T target, Action<T> action) where T: ITuple { }

        public static IEnumerable GetEnumerator(this ITuple tuple) {
            return tuple.GetType().GetFields().Where(x => x.Name.StartsWith("Item"))
                .Select(prop => prop.GetValue(tuple));

//                .GetType()
//                .GetProperties()
//                .Select(property => property.GetValue(tuple));
        }

        public static bool FindKey<T, TV>(this Dictionary<T, TV> dictionary, Func<T, bool> predicate,
            out KeyValuePair<T, TV> value) {
            value = dictionary.FirstOrDefault(kvp => predicate(kvp.Key));
            return !value.Equals(default(KeyValuePair<T, TV>));
        }

        public static bool ContainsList<T>(this IEnumerable<IEnumerable<T>> list, IEnumerable<T> other) {
            if (list == null || !list.Any()) return false;

            if (list.Contains(other)) return true;

            return list.Any(tl => {
                var ret = tl.Count() == other.Count();
                if (ret)
                    tl.ForEach((tp1, ii) => {
                        if (!Equals(tp1, other.ElementAt(ii))) ret = false;
                    });

                return ret;
            });
        }

        /*
         *	//usage
	LinkedListNode<_radar> mark = _radarlist.getNodeAt<_radar>(2);

	//will allow you to check Previous and Next nodes as well
	MessageBox.Show(mark.Previous.Value.value.ToString());
	MessageBox.Show(mark.Value.value.ToString());
	MessageBox.Show(mark.Next.Value.value.ToString());

         */
        public static LinkedListNode<T> getNodeAt<T>(this LinkedList<T> _list, int position) {
            var mark = _list.First;
            var i = 0;
            while (i < position) {
                mark = mark.Next;
                i++;
            }

            return mark;
        }

        public static void Add(this List<string> list, object value) {
            list.Add(value.GetType().FullName + "." + value);
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="array"></param>
        /// <param name="action">i, j, value</param>
        /// <returns></returns>
        public static int[,] ForEach(this int[,] array, Action<int, int, int> action) {
            if (array != null)
                for (var j = 0; j < array.GetLength(1); j++)
                for (var i = 0; i < array.GetLength(0); i++)
                    action?.Invoke(i, j, array[i, j]);

            return array;
        }

        public static List<List<int>> ToCols0(this int[,] array, Action<List<List<int>>> action = null) {
            var ret = new List<List<int>>();
            for (var x = 0; x < array.GetLength(0); x++) {
                var t = new List<int>();
                for (var y = 0; y < array.GetLength(1); y++) t.Add(array[x, y]);

                ret.Add(t);
            }

            action?.Invoke(ret);
            return ret;
        }

        public static List<List<int>> ToRows0(this int[,] array, Action<List<List<int>>> action = null) {
            var ret = new List<List<int>>();
            for (var row = 0; row < array.GetLength(1); row++) {
                var t = new List<int>();
                for (var col = 0; col < array.GetLength(0); col++) t.Add(array[col, row]);

                ret.Add(t);
            }

            action?.Invoke(ret);
            return ret;
        }

        public static List<List<int>> ToRows(this int[,] array, Action<List<List<int>>, List<int>> action = null) {
            return ToRows0(array, t => {
                for (var i = 0; i < t.Count(); i++) action?.Invoke(t, t[i]);
            });
        }

        public static List<List<int>> ToRows2(this int[,] array,
            Action<List<List<int>>, List<int>, int> action = null) {
            return ToRows0(array, t => {
                for (var i = 0; i < t.Count(); i++) action?.Invoke(t, t[i], i);
            });
        }

        public static List<List<int>> ToCols2(this int[,] array,
            Action<List<List<int>>, List<int>, int> action = null) {
            return ToCols0(array, t => {
                for (var i = 0; i < t.Count(); i++) action?.Invoke(t, t[i], i);
            });
        }

        public static List<List<int>> ToCols(this int[,] array, Action<List<List<int>>, List<int>> action = null) {
            return ToCols0(array, t => {
                t.ForEach(ta => {
                    action?.Invoke(t, ta);
                });
            });
        }

        // public static int xForEach<T>(this IEnumerable<T> list, Action<int, T> action)
        // {
        //     if (action == null) {
        //         throw new ArgumentNullException(nameof(action));
        //     }
        //
        //     var index = 0;
        //
        //     foreach (var elem in list) {
        //         action(index++, elem);
        //     }
        //
        //     return index;
        // }

        // public static void xForEach<T>(this IEnumerable<T> source, Action<T> action)
        // {
        //     foreach (var element in source) {
        //         action(element);
        //     }
        // }

        public static void AddOnce<T>(this IList<T> list, params T[] elements) {
            elements.ForEach(element => {
                if (list != null && element != null && !list.Contains(element)) list.Add(element);
            });
        }

        public static void RemoveOnce<T>(this IList<T> list, params T[] elements) {
            elements.ForEach(element => {
                while (list != null && list.Contains(element)) list.Remove(element);
            });
        }
    }
}
