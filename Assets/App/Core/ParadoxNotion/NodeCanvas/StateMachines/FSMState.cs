#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
using Node = NodeCanvas.Framework.Node;
#endregion

namespace NodeCanvas.StateMachines
{
    ///<summary> Base class for fsm nodes that are actually states</summary>
    // [Color("ff6d53")]
    public abstract class FSMState : FSMNode, IState
    {
        public enum TransitionEvaluationMode
        {
            CheckContinuously, CheckAfterStateFinished, CheckManually,
        }

        private bool _hasInit;

        [SerializeField]
        private TransitionEvaluationMode _transitionEvaluation;

        public bool isPrime { get; set; }
        public override bool allowAsPrime => true;
        public override bool canSelfConnect => true;
        public override int maxInConnections => -1;
        public override int maxOutConnections => -1;

        public TransitionEvaluationMode transitionEvaluation {
            get => _transitionEvaluation;
            set => _transitionEvaluation = value;
        }

        ///<summary>Returns all transitions of the state</summary>
        public FSMConnection[] GetTransitions()
        {
            var result = new FSMConnection[outConnections.Count];
            for (var i = 0; i < outConnections.Count; i++)
                result[i] = (FSMConnection)outConnections[i];
            return result;
        }

        public void Finish(bool inSuccess)
        {
            Finish(inSuccess ? Status.Success : Status.Failure);
        }

        ///<summary>Checks and performs possible transition. Returns true if a transition was performed.</summary>
        public bool CheckTransitions()
        {
            for (var i = 0; i < outConnections.Count; i++) {
                var connection = (FSMConnection)outConnections[i];
                var condition = connection.condition;
                if (!connection.isActive) continue;

                if ((condition != null && condition.Check(graphAgent, graphBlackboard))
                    || (condition == null && status != Status.Running)) {
                    FSM.EnterState((FSMState)connection.targetNode, connection.transitionCallMode);
                    connection.status = Status.Success; //editor vis
                    return true;
                }
                connection.status = Status.Failure; //editor vis
            }
            return false;
        }

        ///<summary>Declares that the state has finished</summary>
        public void Finish()
        {
            Finish(Status.Success);
        }

        public void Finish(Status status)
        {
            this.status = status;
        }

        ///----------------------------------------------------------------------------------------------
        public override void OnGraphPaused()
        {
            if (status == Status.Running) OnPause();
        }

        ///----------------------------------------------------------------------------------------------

        //avoid connecting from same source
        protected override bool CanConnectFromSource(Node sourceNode)
        {
            if (IsChildOf(sourceNode)) {
                Logger.LogWarning(
                    "States are already connected together. Consider using multiple conditions on an existing transition instead",
                    LogTag.EDITOR, this);
                return false;
            }
            return true;
        }

        //avoid connecting to same target
        protected override bool CanConnectToTarget(Node targetNode)
        {
            if (IsParentOf(targetNode)) {
                Logger.LogWarning(
                    "States are already connected together. Consider using multiple conditions on an existing transition instead",
                    LogTag.EDITOR, this);
                return false;
            }
            return true;
        }

        //OnEnter...
        protected sealed override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (!_hasInit) {
                _hasInit = true;
                OnInit();
            }

            if (status == Status.Resting) {
                status = Status.Running;
                for (var i = 0; i < outConnections.Count; i++)
                    ((FSMConnection)outConnections[i]).EnableCondition(agent, bb);
                OnEnter();
            }
            else {
                var case1 = transitionEvaluation == TransitionEvaluationMode.CheckContinuously;
                var case2 = transitionEvaluation == TransitionEvaluationMode.CheckAfterStateFinished
                        && status != Status.Running;
                if (case1 || case2) CheckTransitions();
                if (status == Status.Running) OnUpdate();
            }
            return status;
        }

        //OnExit...
        protected sealed override void OnReset()
        {
            for (var i = 0; i < outConnections.Count; i++)
                ((FSMConnection)outConnections[i]).DisableCondition();
#if UNITY_EDITOR
            //Done for visualizing in editor
            for (var i = 0; i < inConnections.Count; i++) inConnections[i].status = Status.Resting;
#endif
            OnExit();
        }

        //Converted
        protected virtual void OnInit() { }
        protected virtual void OnEnter() { }
        protected virtual void OnUpdate() { }
        protected virtual void OnExit() { }
        protected virtual void OnPause() { }
        //

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        public override void OnValidate(Graph assignedGraph)
        {
            base.OnValidate(assignedGraph);
            Debug.Log("Test");
        }

        //just a default orange color
        public override void OnCreate(Graph assignedGraph)
        {
            customColor = new Color(1, 0.42f, 0.32f);
        }

        //...
        protected override void OnNodeInspectorGUI()
        {
            ShowTransitionsInspector();
            DrawDefaultInspector();
        }

        protected override void OnNodeExternalGUI()
        {
            var peek = FSM.PeekStack();

            if (peek != null && FSM.currentState == this) {
                Handles.color = Color.grey;
                Handles.DrawAAPolyLine(rect.center, peek.rect.center);
                Handles.color = Color.white;
            }
        }

        //...
        protected override GenericMenu OnContextMenu(GenericMenu menu)
        {
            if (Application.isPlaying)
                menu.AddItem(new GUIContent("Enter State"), false, () => {
                    FSM.EnterState(this, FSM.TransitionCallMode.Normal);
                });
            else
                menu.AddDisabledItem(new GUIContent("Enter State"));
            menu.AddItem(new GUIContent("Breakpoint"), isBreakpoint, () => {
                isBreakpoint = !isBreakpoint;
            });
            return menu;
        }

        //...
        protected void ShowTransitionsInspector()
        {
            EditorUtils.CoolLabel("Transitions");
            if (outConnections.Count == 0)
                EditorGUILayout.HelpBox("No Transition", MessageType.None);
            var onFinishExists = false;
            EditorUtils.ReorderableList(outConnections, (i, picked) => {
                var connection = (FSMConnection)outConnections[i];
                GUILayout.BeginHorizontal("box");

                if (connection.condition != null) {
                    GUILayout.Label(connection.condition.summaryInfo, GUILayout.MinWidth(0),
                        GUILayout.ExpandWidth(true));
                }
                else {
                    GUILayout.Label("OnFinish" + (onFinishExists ? " (exists)" : string.Empty),
                        GUILayout.MinWidth(0), GUILayout.ExpandWidth(true));
                    onFinishExists = true;
                }
                GUILayout.FlexibleSpace();
                GUILayout.Label("► '" + connection.targetNode.name + "'");
                GUILayout.EndHorizontal();
            });
            transitionEvaluation =
                    (TransitionEvaluationMode)EditorGUILayout.EnumPopup(transitionEvaluation);
            EditorUtils.BoldSeparator();
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
