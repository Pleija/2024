﻿using NodeCanvas.Framework;
using ParadoxNotion.Design;

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard"), System.Obsolete("Use CheckVariable(T)")]
    public class CheckUnityObject : ConditionTask
    {
        [BlackboardOnly]
        public BBParameter<UnityEngine.Object> valueA;

        public BBParameter<UnityEngine.Object> valueB;
        protected override string info => valueA + " == " + valueB;
        protected override bool OnCheck() => valueA.value == valueB.value;
    }
}
