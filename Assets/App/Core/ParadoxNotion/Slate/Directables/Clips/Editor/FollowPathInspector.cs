#if UNITY_EDITOR

#region
using Slate.ActionClips;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomEditor(typeof(FollowPath))]
    public class FollowPathInspector : ActionClipInspector<FollowPath>
    {
        public override void OnInspectorGUI()
        {
            base.OnInspectorGUI();

            if (action.path == null)
                if (GUILayout.Button("Create New Path")) {
                    action.path = BezierPath.Create(action.root.context.transform);
                    Selection.activeObject = action.path;
                }
        }
    }
}

#endif
