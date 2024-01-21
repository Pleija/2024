#if UNITY_EDITOR
using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.TestTools;

namespace MoreTags
{
    using Object = UnityEngine.Object;

    [InitializeOnLoad, ExcludeFromCoverage]
    public class InspectorGUI
    {
        static InspectorGUI()
        {
            Editor.finishedDefaultHeaderGUI += OnPostHeaderGUI;
        }

        [ExcludeFromCoverage]
        private static void OnPostHeaderGUI(Editor editor)
        {
            if (editor.targets.Length == 0) return;
            if (editor.targets[0].GetType() != typeof(GameObject))
                return;
            var go = editor.targets[0] as GameObject;
            var component = go.HasComponent<Tags>();

            if (!EditorGUILayout.ToggleLeft("#tags", component)) {
                if (component) {
                    go.RemoveTag(component.tags);
                    component.DestroySelf();
                }
                return;
            }
            component = go.RequireComponent<Tags>();
            component.tagData.TagGUI(null, gui => {
                Action<string> onChange = s => EditorSceneManager.MarkSceneDirty(component.gameObject.scene);
                gui.OnAddItem += onChange;
                gui.OnClickItem += onChange;
                gui.OnRemoveItem += onChange;
                gui.OnRightClickItem += (r, s) => onChange.Invoke(s);
            });

            //GUILayout.Button("Test#1");
        }
    }
}
#endif
