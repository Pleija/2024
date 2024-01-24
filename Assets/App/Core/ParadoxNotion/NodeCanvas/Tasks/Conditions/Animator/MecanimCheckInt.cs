#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Name("Check Parameter Int"), Category("Animator")]
    public class MecanimCheckInt : ConditionTask<Animator>
    {
        public CompareMethod comparison = CompareMethod.EqualTo;

        [RequiredField]
        public BBParameter<string> parameter;

        public BBParameter<int> value;

        protected override string info =>
                "Mec.Int " + parameter + OperationTools.GetCompareString(comparison) + value;

        protected override bool OnCheck() =>
                OperationTools.Compare(agent.GetInteger(parameter.value), value.value, comparison);
    }
}
