#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject"),
     Description(
         "Checks the current speed of the agent against a value based on it's Rigidbody velocity")]
    public class CheckSpeed : ConditionTask<Rigidbody>
    {
        public CompareMethod checkType = CompareMethod.EqualTo;

        [SliderField(0, 0.1f)]
        public float differenceThreshold = 0.05f;

        public BBParameter<float> value;

        protected override string info =>
                "Speed" + OperationTools.GetCompareString(checkType) + value;

        protected override bool OnCheck()
        {
            var speed = agent.velocity.magnitude;
            return OperationTools.Compare(speed, value.value, checkType, differenceThreshold);
        }
    }
}
