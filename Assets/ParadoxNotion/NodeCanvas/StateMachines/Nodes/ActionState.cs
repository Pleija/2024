using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using MoreTags;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using Puerts;
using Sirenix.Utilities;
using UnityEngine;
using Zu.TypeScript;
using Zu.TypeScript.Change;
using Zu.TypeScript.TsTypes;

namespace NodeCanvas.StateMachines
{
    [Name("Action State", 100)]
    [Description(
        "Execute a number of Action Tasks OnEnter. All actions will be stoped OnExit. This state is Finished when all Actions are finished as well")]
    public class ActionState : FSMState, ITaskAssignable, IUpdatable
    {
        [SerializeField]
        private ActionList _actionList;

        [SerializeField]
        private bool _repeatStateActions;

        public Task task {
            get { return actionList; }
            set { actionList = (ActionList)value; }
        }

        public ActionList actionList {
            get { return _actionList; }
            set { _actionList = value; }
        }

        public bool repeatStateActions {
            get { return _repeatStateActions; }
            set { _repeatStateActions = value; }
        }

        public override void OnValidate(Graph assignedGraph)
        {
            // if(!assignedGraph.agent.name.Contains(".") && !assignedGraph.agent.name.Contains("(") &&
            //    !assignedGraph.agent.name.Contains(" ") && Application.isEditor) {
            //     TagSystem.AddTag("FSM." + ((FSM)assignedGraph).FsmName);
            // }

            if (actionList == null) {
                actionList = (ActionList)Task.Create(typeof(ActionList), assignedGraph);
                actionList.executionMode = ActionList.ActionsExecutionMode.ActionsRunInParallel;
            }

            // if(Application.isEditor) {
            //     var path = MakeFile();
            //     assignedGraph.CheckVarsFromTs(path, localBlackboard);
            // }
        }

        //public override void OnGraphStarted() { }
        //public override void OnGraphStoped() { }
        protected override void OnInit()
        {
            fsm.Invoke("bindNode",this);
        }

        protected override void OnEnter()
        {
            fsm.Invoke("enterNode", this);

            //OnUpdate();
            var actionListStatus = actionList.Execute(graphAgent, graphBlackboard);

            if (!repeatStateActions && actionListStatus != Status.Running) {
                Finish(actionListStatus);
            }
        }

        protected override void OnUpdate()
        {
            fsm.Invoke("updateNode", this);
            var actionListStatus = actionList.Execute(graphAgent, graphBlackboard);

            if (!repeatStateActions && actionListStatus != Status.Running) {
                Finish(actionListStatus);
            }
        }

        protected override void OnExit()
        {
            fsm.Invoke("exitNode", this);
            actionList.EndAction(null);
        }

        protected override void OnPause()
        {
            actionList.Pause();
        }

        void IUpdatable.Update()
        {
            //on graph update
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeGUI()
        {
            if (repeatStateActions) {
                GUILayout.Label("<b>[REPEAT]</b>");
            }
            base.OnNodeGUI();
        }

        protected override void OnNodeInspectorGUI()
        {
            ShowTransitionsInspector();

            if (actionList == null) {
                return;
            }
            EditorUtils.CoolLabel("Actions");
            GUI.color = repeatStateActions ? GUI.color : new Color(1, 1, 1, 0.5f);
            repeatStateActions = UnityEditor.EditorGUILayout.ToggleLeft("Repeat State Actions", repeatStateActions);
            GUI.color = Color.white;
            actionList.ShowListGUI();
            actionList.ShowNestedActionsGUI();
        }

#endif
    }
}
