#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Name("Check Parameter Float"), Category("Animator")]
    public class MecanimCheckFloat : ConditionTask<Animator>
    {
        public CompareMethod comparison = CompareMethod.EqualTo;

        [RequiredField]
        public BBParameter<string> parameter;

        public BBParameter<float> value;

        protected override string info => "Mec.Float "
                + parameter
                + OperationTools.GetCompareString(comparison)
                + value;

        protected override bool OnCheck() => OperationTools.Compare(agent.GetFloat(parameter.value),
            value.value, comparison, 0.1f);
    }
}
