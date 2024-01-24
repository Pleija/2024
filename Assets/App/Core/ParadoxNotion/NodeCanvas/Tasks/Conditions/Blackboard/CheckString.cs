﻿#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class CheckString : ConditionTask
    {
        [BlackboardOnly]
        public BBParameter<string> valueA;

        public BBParameter<string> valueB;
        protected override string info => valueA + " == " + valueB;
        protected override bool OnCheck() => valueA.value == valueB.value;
    }
}
