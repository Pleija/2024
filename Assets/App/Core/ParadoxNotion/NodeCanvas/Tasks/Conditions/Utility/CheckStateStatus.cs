#region
using NodeCanvas.Framework;
using NodeCanvas.StateMachines;
using ParadoxNotion;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Utility"),
     Description(
         "Check the parent state status. This condition is only meant to be used along with an FSM system.")]
    public class CheckStateStatus : ConditionTask
    {
        public CompactStatus status = CompactStatus.Success;
        protected override string info => string.Format("State == {0}", status);

        protected override bool OnCheck()
        {
            var fsm = ownerSystem as FSM;

            if (fsm != null) {
                var state = fsm.currentState;
                return (int)state.status == (int)status;
            }
            return false;
        }
    }
}
