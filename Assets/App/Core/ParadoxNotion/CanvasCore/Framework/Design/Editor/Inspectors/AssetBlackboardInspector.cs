#if UNITY_EDITOR

#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities.Editor;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Editor
{
    [CustomEditor(typeof(AssetBlackboard))]
    public class AssetBlackboardInspector : OdinEditor
    {
        private AssetBlackboard bb => (AssetBlackboard)target;
        private UnityEditor.Editor editor { get; set; }

        protected override void OnEnable()
        {
            base.OnEnable();

            // if (bb.Data == null) {
            //     bb.Data = new BlackBoardData();
            //     UndoUtility.SetDirty(bb);
            //     AssetDatabase.SaveAssets();
            // }
            // if (!editor) editor = CreateEditor(bb);
        }

        public override void OnInspectorGUI()
        {
            bb.showFold = EditorGUILayout.Foldout(bb.showFold, "#Database");

            if (bb.showFold) {
                // GUILayout.Box("table: " + bb.tableName, GUILayout.ExpandWidth(true));
                // //GUILayout.Label("test");
                // GUILayout.BeginVertical();
                // if (editor) editor.OnInspectorGUI();
                // GUILayout.EndVertical();
                 base.OnInspectorGUI();
            }
            else {
                BlackboardEditor.ShowVariables(bb);
                //this.RepaintIfRequested();
            }
            Repaint();
            EditorUtils.EndOfInspector();
        }
    }
}

#endif
