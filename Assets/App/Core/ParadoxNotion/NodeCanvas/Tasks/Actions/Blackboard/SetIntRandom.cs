#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Set Integer Random"), Category("✫ Blackboard"),
     Description("Set a blackboard integer variable at random between min and max value")]
    public class SetIntRandom : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<int> intVariable;

        public BBParameter<int> maxValue;
        public BBParameter<int> minValue;

        protected override string info =>
                "Set " + intVariable + " Random(" + minValue + ", " + maxValue + ")";

        protected override void OnExecute()
        {
            intVariable.value = Random.Range(minValue.value, maxValue.value + 1);
            EndAction();
        }
    }
}
