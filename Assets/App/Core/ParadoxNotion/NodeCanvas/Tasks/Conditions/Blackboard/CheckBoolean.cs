#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class CheckBoolean : ConditionTask
    {
        [BlackboardOnly]
        public BBParameter<bool> valueA;

        public BBParameter<bool> valueB = true;
        protected override string info => valueA + " == " + valueB;
        protected override bool OnCheck() => valueA.value == valueB.value;
    }
}
