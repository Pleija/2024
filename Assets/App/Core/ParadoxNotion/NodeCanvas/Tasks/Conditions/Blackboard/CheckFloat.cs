#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class CheckFloat : ConditionTask
    {
        public CompareMethod checkType = CompareMethod.EqualTo;

        [SliderField(0, 0.1f)]
        public float differenceThreshold = 0.05f;

        [BlackboardOnly]
        public BBParameter<float> valueA;

        public BBParameter<float> valueB;

        protected override string info =>
                valueA + OperationTools.GetCompareString(checkType) + valueB;

        protected override bool OnCheck() => OperationTools.Compare(valueA.value, valueB.value,
            checkType, differenceThreshold);
    }
}
