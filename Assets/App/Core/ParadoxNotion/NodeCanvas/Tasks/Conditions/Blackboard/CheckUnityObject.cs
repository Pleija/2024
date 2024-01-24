#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using Object = UnityEngine.Object;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard"), Obsolete("Use CheckVariable(T)")]
    public class CheckUnityObject : ConditionTask
    {
        [BlackboardOnly]
        public BBParameter<Object> valueA;

        public BBParameter<Object> valueB;
        protected override string info => valueA + " == " + valueB;
        protected override bool OnCheck() => valueA.value == valueB.value;
    }
}
