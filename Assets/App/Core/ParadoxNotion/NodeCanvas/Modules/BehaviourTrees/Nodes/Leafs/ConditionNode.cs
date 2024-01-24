#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    [Name("Condition"), Description("Checks a condition and returns Success or Failure."),
     Icon("Condition")]
    // [Color("ff6d53")]
    public class ConditionNode : BTNode, ITaskAssignable<ConditionTask>
    {
        [SerializeField]
        private ConditionTask _condition;

        public ConditionTask condition {
            get => _condition;
            set => _condition = value;
        }

        public Task task {
            get => condition;
            set => condition = (ConditionTask)value;
        }

        public override string name => base.name.ToUpper();

        protected override Status OnExecute(Component agent, IBlackboard blackboard)
        {
            if (condition == null) return Status.Optional;
            if (status == Status.Resting) condition.Enable(agent, blackboard);
            return condition.Check(agent, blackboard) ? Status.Success : Status.Failure;
        }

        protected override void OnReset()
        {
            if (condition != null) condition.Disable();
        }
    }
}
