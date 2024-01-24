#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    /// <summary>
    ///     Task Action is used to check ConditionTasks within the flowgraph in a simplified manner
    ///     without exposing ports
    /// </summary>
    [Description(
        "Returns an encapsulated condition check without exposing any value ports other than the boolean check")]
    public class TaskCondition : FlowNode, ITaskAssignable<ConditionTask>
    {
        [SerializeField]
        private ConditionTask _condition;

        public ConditionTask condition {
            get => _condition;
            set => _condition = value;
        }

        public override string name => condition != null ? condition.name : "Condition";

        Task ITaskAssignable.task {
            get => condition;
            set => condition = (ConditionTask)value;
        }

        public override void OnGraphStarted()
        {
            if (condition != null) condition.Enable(graphAgent, graphBlackboard);
        }

        public override void OnGraphStoped()
        {
            if (condition != null) condition.Disable();
        }

        protected override void RegisterPorts()
        {
            AddValueOutput("Condition", () => {
                if (condition != null) return condition.Check(graphAgent, graphBlackboard);
                return false;
            });
        }
    }
}
