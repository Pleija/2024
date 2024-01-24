#if UNITY_EDITOR

#region
using Slate.ActionClips;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomEditor(typeof(AnimateProperties))]
    public class AnimatePropertiesInspector : ActionClipInspector<AnimateProperties>
    {
        public override void OnInspectorGUI()
        {
            base.OnInspectorGUI();
            GUILayout.Space(10);
            if (GUILayout.Button("Add Property"))
                EditorTools.ShowAnimatedPropertySelectionMenu(action.actor.gameObject,
                    action.TryAddParameter);
        }
    }
}

#endif
