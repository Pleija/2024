#region
using System.Collections;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    /// <summary>
    ///     Task Action is used to run ActionTasks within the flowscript in a simplified manner
    ///     without exposing ports
    /// </summary>
    [Description("Execute an encapsulated action without exposing any value ports")]
    public class TaskAction : FlowNode, ITaskAssignable<ActionTask>
    {
        [SerializeField]
        private ActionTask _action;

        private Coroutine coroutine;
        private FlowOutput onFinish;

        public ActionTask action {
            get => _action;
            set {
                if (_action != value) {
                    _action = value;
                    GatherPorts();
                }
            }
        }

        public override string name => action != null ? action.name : "Action";

        Task ITaskAssignable.task {
            get => action;
            set => action = (ActionTask)value;
        }

        public override void OnGraphStarted()
        {
            coroutine = null;
        }

        public override void OnGraphStoped()
        {
            if (coroutine != null) {
                StopCoroutine(coroutine);
                coroutine = null;
            }
            if (action != null) action.EndAction(null);
        }

        public override void OnGraphPaused()
        {
            if (action != null) action.Pause();
        }

        protected override void RegisterPorts()
        {
            onFinish = AddFlowOutput(SPACE);
            AddFlowInput(SPACE, f => {
                if (action == null) {
                    onFinish.Call(f);
                    return;
                }
                if (coroutine == null) coroutine = StartCoroutine(DoUpdate(f));
            });
        }

        private IEnumerator DoUpdate(Flow f)
        {
            SetStatus(Status.Running);
            while (graph.isPaused || action.Execute(graphAgent, graphBlackboard) == Status.Running)
                yield return null;
            coroutine = null;
            onFinish.Call(f);
            SetStatus(Status.Resting);
        }
    }
}
