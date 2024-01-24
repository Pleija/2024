#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    [Category("Composites"),
     Description("Quick way to execute the left or the right child, based on a Condition Task."),
     Icon("Condition"), Color("b3ff7f")]
    public class BinarySelector : BTNode, ITaskAssignable<ConditionTask>
    {
        [SerializeField]
        private ConditionTask _condition;

        [Tooltip("If true, the condition will be re-evaluated per frame.")]
        public bool dynamic;

        private int succeedIndex;
        public override int maxOutConnections => 2;
        public override Alignment2x2 commentsAlignment => Alignment2x2.Right;

        private ConditionTask condition {
            get => _condition;
            set => _condition = value;
        }

        public override string name => base.name.ToUpper();

        public Task task {
            get => condition;
            set => condition = (ConditionTask)value;
        }

        protected override Status OnExecute(Component agent, IBlackboard blackboard)
        {
            if (condition == null || outConnections.Count < 2) return Status.Optional;
            if (status == Status.Resting) condition.Enable(agent, blackboard);

            if (dynamic || status == Status.Resting) {
                var lastIndex = succeedIndex;
                succeedIndex = condition.Check(agent, blackboard) ? 0 : 1;
                if (succeedIndex != lastIndex) outConnections[lastIndex].Reset();
            }
            return outConnections[succeedIndex].Execute(agent, blackboard);
        }

        protected override void OnReset()
        {
            if (condition != null) condition.Disable();
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        public override string GetConnectionInfo(int i)
        {
            return i == 0 ? "TRUE" : "FALSE";
        }

        protected override void OnNodeGUI()
        {
            if (dynamic) GUILayout.Label("<b>DYNAMIC</b>");
        }

#endif
    }
}
