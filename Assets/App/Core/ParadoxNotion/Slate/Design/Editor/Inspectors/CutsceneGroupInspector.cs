#if UNITY_EDITOR

#region
using Sirenix.OdinInspector.Editor;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomEditor(typeof(CutsceneGroup), true)]
    public class CutsceneGroupInspector : OdinEditor
    {
        private CutsceneGroup group => (CutsceneGroup)target;

        public override void OnInspectorGUI()
        {
            GUI.enabled = group.root.currentTime == 0;
            base.OnInspectorGUI();
        }
    }
}

#endif
