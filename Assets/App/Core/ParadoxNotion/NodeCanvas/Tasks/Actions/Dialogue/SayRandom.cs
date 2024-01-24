#region
using System.Collections.Generic;
using NodeCanvas.DialogueTrees;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Dialogue"), Icon("Dialogue"),
     Description("A random statement will be chosen each time for the actor to say")]
    public class SayRandom : ActionTask<IDialogueActor>
    {
        public List<Statement> statements = new List<Statement>();

        protected override void OnExecute()
        {
            var index = Random.Range(0, statements.Count);
            var statement = statements[index];
            var tempStatement = statement.BlackboardReplace(blackboard);
            var info = new SubtitlesRequestInfo(agent, tempStatement, EndAction);
            DialogueTree.RequestSubtitles(info);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            var options = new EditorUtils.ReorderableListOptions();
            options.allowAdd = true;
            options.allowRemove = true;
            options.unityObjectContext = ownerSystem.contextObject;
            EditorUtils.ReorderableList(statements, options, (i, picked) => {
                if (statements[i] == null) statements[i] = new Statement("...");
                var statement = statements[i];
                statement.text = EditorGUILayout.TextArea(
                    statement.text, "textField", GUILayout.Height(50));
                statement.audio = (AudioClip)EditorGUILayout.ObjectField("Audio Clip",
                    statement.audio, typeof(AudioClip), false);
                statement.meta = EditorGUILayout.TextField("Meta", statement.meta);
                EditorUtils.Separator();
            });
        }
#endif
    }
}
