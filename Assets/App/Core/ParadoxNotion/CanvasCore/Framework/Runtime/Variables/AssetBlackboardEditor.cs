using Sirenix.OdinInspector.Editor;
using UnityEditor;

#if UNITY_EDITOR


namespace NodeCanvas.Framework
{
    [CustomEditor(typeof(AssetBlackboard))]
    public class AssetBlackboardEditor : OdinEditor { }
}
#endif
