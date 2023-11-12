using System.Collections.Generic;
using System.Linq;

namespace Common.Extensions
{
    public static class Lists
    {
        public static T getFirst<T>(this IEnumerable<T> value) => value.FirstOrDefault();
    }
}
