#region
using System;
using System.Collections.Generic;
using System.Linq;
#endregion

namespace FlowCanvas.Nodes
{
    [Obsolete]
    public class ConvertTo<T> : PureFunctionNode<T, IConvertible> where T : IConvertible
    {
        public override T Invoke(IConvertible obj) => (T)Convert.ChangeType(obj, typeof(T));
    }

    [Obsolete]
    public class CastTo<T> : PureFunctionNode<T, object>
    {
        public override T Invoke(object obj)
        {
            try {
                return (T)obj;
            }
            catch {
                return default;
            }
        }
    }

    [Obsolete]
    public class ToArray<T> : PureFunctionNode<T[], IList<T>>
    {
        public override T[] Invoke(IList<T> list) => list.ToArray();
    }

    [Obsolete]
    public class ToList<T> : PureFunctionNode<List<T>, IList<T>>
    {
        public override List<T> Invoke(IList<T> list) => list.ToList();
    }
}
