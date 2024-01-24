#if UNITY_EDITOR

#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Editor
{
    [CustomEditor(typeof(ActionListPlayer))]
    public class ActionListPlayerInspector : UnityEditor.Editor
    {
        private ActionListPlayer list => (ActionListPlayer)target;

        public override void OnInspectorGUI()
        {
            GUI.skin.label.richText = true;
            GUILayout.Space(10);
            list.playOnAwake = EditorGUILayout.Toggle("Play On Awake", list.playOnAwake);
            list.blackboard = (Blackboard)EditorGUILayout.ObjectField("Target Blackboard",
                (Blackboard)list.blackboard, typeof(Blackboard), true);
            TaskEditor.TaskFieldSingle(list.actionList, null, false);
            EditorUtils.EndOfInspector();
            if (Event.current.isMouse || list.actionList.isRunning) Repaint();
        }
    }
}

#endif
