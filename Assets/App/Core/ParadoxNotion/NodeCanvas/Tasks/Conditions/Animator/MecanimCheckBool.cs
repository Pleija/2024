#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Name("Check Parameter Bool"), Category("Animator")]
    public class MecanimCheckBool : ConditionTask<Animator>
    {
        [RequiredField]
        public BBParameter<string> parameter;

        public BBParameter<bool> value;
        protected override string info => "Mec.Bool " + parameter + " == " + value;
        protected override bool OnCheck() => agent.GetBool(parameter.value) == value.value;
    }
}
