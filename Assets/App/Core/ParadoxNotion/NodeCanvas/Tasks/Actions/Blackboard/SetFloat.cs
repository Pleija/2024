#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"), Description("Set a blackboard float variable")]
    public class SetFloat : ActionTask
    {
        public OperationMethod Operation = OperationMethod.Set;
        public bool perSecond;

        [BlackboardOnly]
        public BBParameter<float> valueA;

        public BBParameter<float> valueB;

        protected override string info => string.Format("{0} {1} {2}{3}", valueA,
            OperationTools.GetOperationString(Operation), valueB,
            perSecond ? " Per Second" : "");

        protected override void OnExecute()
        {
            valueA.value = OperationTools.Operate(valueA.value, valueB.value, Operation,
                perSecond ? Time.deltaTime : 1f);
            EndAction(true);
        }
    }
}
