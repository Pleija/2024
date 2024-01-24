#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    [Category("Decorators"),
     Description(
         "Returns Running until the assigned condition becomes true, after which the decorated child is executed."),
     Icon("Halt")]
    public class WaitUntil : BTDecorator, ITaskAssignable<ConditionTask>
    {
        [SerializeField]
        private ConditionTask _condition;

        private bool accessed;

        private ConditionTask condition {
            get => _condition;
            set => _condition = value;
        }

        public Task task {
            get => condition;
            set => condition = (ConditionTask)value;
        }

        protected override Status OnExecute(Component agent, IBlackboard blackboard)
        {
            if (decoratedConnection == null) {
                //this part is so that Wait node can be used as a leaf too, by user request
                if (condition != null) {
                    if (status == Status.Resting) condition.Enable(agent, blackboard);
                    return condition.Check(agent, blackboard) ? Status.Success : Status.Running;
                }
                //-----
                return Status.Optional;
            }
            if (condition == null) return decoratedConnection.Execute(agent, blackboard);
            if (status == Status.Resting) condition.Enable(agent, blackboard);
            if (accessed) return decoratedConnection.Execute(agent, blackboard);
            if (condition.Check(agent, blackboard)) accessed = true;
            return accessed ? decoratedConnection.Execute(agent, blackboard) : Status.Running;
        }

        protected override void OnReset()
        {
            if (condition != null) condition.Disable();
            accessed = false;
        }
    }
}
