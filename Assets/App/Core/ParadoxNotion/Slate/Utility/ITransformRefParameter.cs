#region
using UnityEngine;
#endregion

namespace Slate
{
    public interface ITransformRefParameter
    {
        Transform transform { get; }
        TransformSpace space { get; }
        bool useAnimation { get; }
    }
}
