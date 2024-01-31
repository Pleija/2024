#region
using System;
using System.Collections.Generic;

#if UNITY_EDITOR
using NodeCanvas.Editor;
#endif
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace NodeCanvas.DialogueTrees
{
    [Icon("List"), Name("Multiple Choice"), Category("Branch"),
     Description(
         "Prompt a Dialogue Multiple Choice. A choice will be available if the choice condition(s) are true or there is no choice conditions. The Actor selected is used for the condition checks and will also Say the selection if the option is checked."),
     Color("b3ff7f")]
    public class MultipleChoiceNode : DTNode
    {
        [SerializeField, AutoSortWithChildrenConnections]
        private List<Choice> availableChoices = new List<Choice>();

        ///----------------------------------------------------------------------------------------------
        [SliderField(0f, 10f)]
        public float availableTime;

        public bool saySelection;
        public override int maxOutConnections => availableChoices.Count;
        public override bool requireActorSelection => true;

        protected override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (outConnections.Count == 0)
                return Error("There are no connections to the Multiple Choice Node!");
            var finalOptions = new Dictionary<IStatement, int>();

            for (var i = 0; i < availableChoices.Count; i++) {
                var condition = availableChoices[i].condition;

                if (condition == null || condition.CheckOnce(finalActor.transform, bb)) {
                    var tempStatement = availableChoices[i].statement.BlackboardReplace(bb);
                    finalOptions[tempStatement] = i;
                }
            }

            if (finalOptions.Count == 0) {
                Logger.Log("Multiple Choice Node has no available options. Dialogue Ends.",
                    LogTag.EXECUTION, this);
                DLGTree.Stop(false);
                return Status.Failure;
            }
            var optionsInfo = new MultipleChoiceRequestInfo(finalActor, finalOptions, availableTime,
                OnOptionSelected);
            optionsInfo.showLastStatement = true;
            DialogueTree.RequestMultipleChoices(optionsInfo);
            return Status.Running;
        }

        private void OnOptionSelected(int index)
        {
            status = Status.Success;
            Action Finalize = () => {
                DLGTree.Continue(index);
            };

            if (saySelection) {
                var tempStatement = availableChoices[index]
                        .statement
                        .BlackboardReplace(graphBlackboard);
                var speechInfo = new SubtitlesRequestInfo(finalActor, tempStatement, Finalize);
                DialogueTree.RequestSubtitles(speechInfo);
            }
            else {
                Finalize();
            }
        }

        [Serializable]
        public class Choice
        {
            public bool isUnfolded = true;
            public Statement statement;
            public ConditionTask condition;
            public Choice() { }
            public Choice(Statement statement) => this.statement = statement;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        public override void OnConnectionInspectorGUI(int i)
        {
            if (i >= 0) DoChoiceGUI(availableChoices[i]);
        }

        public override string GetConnectionInfo(int i)
        {
            if (i >= availableChoices.Count) return "NOT SET";
            var text = string.Format("'{0}'", availableChoices[i].statement.text);
            if (availableChoices[i].condition == null) return text;
            return string.Format("{0}\n{1}", text, availableChoices[i].condition.summaryInfo);
        }

        protected override void OnNodeGUI()
        {
            if (availableChoices.Count == 0) {
                GUILayout.Label("No Options Available");
                return;
            }

            for (var i = 0; i < availableChoices.Count; i++) {
                var choice = availableChoices[i];
                var connection = i < outConnections.Count ? outConnections[i] : null;
                GUILayout.BeginHorizontal(Styles.roundedBox);
                GUILayout.Label(string.Format("{0} {1}", connection != null ? "■" : "□",
                    choice.statement.text.CapLength(30)), Styles.leftLabel);
                GUILayout.EndHorizontal();
            }
            GUILayout.BeginHorizontal();
            if (availableTime > 0) GUILayout.Label(availableTime + "' Seconds");
            if (saySelection) GUILayout.Label("Say Selection");
            GUILayout.EndHorizontal();
        }

        protected override void OnNodeInspectorGUI()
        {
            base.OnNodeInspectorGUI();
            if (GUILayout.Button("Add Choice"))
                availableChoices.Add(new Choice(new Statement("I am a choice...")));
            if (availableChoices.Count == 0) return;
            EditorUtils.ReorderableList(availableChoices, (i, picked) => {
                var choice = availableChoices[i];
                GUILayout.BeginHorizontal("box");
                var text = string.Format("{0} {1}", choice.isUnfolded ? "▼ " : "► ",
                    choice.statement.text);
                if (GUILayout.Button(text, "label", GUILayout.Width(0),
                    GUILayout.ExpandWidth(true)))
                    choice.isUnfolded = !choice.isUnfolded;

                if (GUILayout.Button("X", GUILayout.Width(20))) {
                    availableChoices.RemoveAt(i);
                    if (i < outConnections.Count) graph.RemoveConnection(outConnections[i]);
                }
                GUILayout.EndHorizontal();
                if (choice.isUnfolded) DoChoiceGUI(choice);
            });
        }

        private void DoChoiceGUI(Choice choice)
        {
            GUILayout.BeginHorizontal();
            GUILayout.Space(10);
            GUILayout.BeginVertical("box");
            choice.statement.text = EditorGUILayout.TextField(choice.statement.text);
            choice.statement.audio = EditorGUILayout.ObjectField(
                "Audio File", choice.statement.audio, typeof(AudioClip), false) as AudioClip;
            choice.statement.meta = EditorGUILayout.TextField("Meta Data", choice.statement.meta);
            TaskEditor.TaskFieldMulti(choice.condition, graph, c => {
                choice.condition = c;
            });
            GUILayout.EndVertical();
            GUILayout.EndHorizontal();
            GUILayout.Space(10);
        }

#endif
    }
}
