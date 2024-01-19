#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.TestTools;

namespace MoreTags
{
    using Object = UnityEngine.Object;

    [InitializeOnLoad, ExcludeFromCoverage]
    public class InspectorGUI
    {
        private static readonly object s_ToggleMixed;
        private static readonly GUIContent s_ToggleText;

        static InspectorGUI()
        {
            s_ToggleMixed = null;
            s_ToggleText = new GUIContent("Tags", "");
            Editor.finishedDefaultHeaderGUI += OnPostHeaderGUI;
        }

        [ExcludeFromCoverage]
        private static void OnPostHeaderGUI(Editor editor)
        {
            if (editor.targets.Length == 0) return;
            if (editor.targets[0].GetType() != typeof(GameObject))
                return;
            GUILayout.Button("Test#1");
        }
    }
}
#endif
