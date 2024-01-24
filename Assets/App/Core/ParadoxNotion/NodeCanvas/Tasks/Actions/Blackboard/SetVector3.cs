#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"), Description("Set a blackboard Vector3 variable")]
    public class SetVector3 : ActionTask
    {
        public OperationMethod operation;
        public bool perSecond;

        [BlackboardOnly]
        public BBParameter<Vector3> valueA;

        public BBParameter<Vector3> valueB;

        protected override string info => string.Format("{0} {1} {2}{3}", valueA,
            OperationTools.GetOperationString(operation), valueB,
            perSecond ? " Per Second" : "");

        protected override void OnExecute()
        {
            valueA.value = OperationTools.Operate(valueA.value, valueB.value, operation,
                perSecond ? Time.deltaTime : 1f);
            EndAction();
        }
    }
}
