#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard"), Description("Check whether or not a variable is null")]
    public class CheckNull : ConditionTask
    {
        [BlackboardOnly]
        public BBParameter<object> variable;

        protected override string info => variable + " == null";
        protected override bool OnCheck() => ObjectUtils.AnyEquals(variable.value, null);
    }
}
