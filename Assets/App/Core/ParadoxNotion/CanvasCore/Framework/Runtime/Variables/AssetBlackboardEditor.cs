

#if UNITY_EDITOR


using Sirenix.OdinInspector.Editor;
using UnityEditor;
namespace NodeCanvas.Framework
{
    [CustomEditor(typeof(AssetBlackboard))]
    public class AssetBlackboardEditor : OdinEditor { }
}
#endif
