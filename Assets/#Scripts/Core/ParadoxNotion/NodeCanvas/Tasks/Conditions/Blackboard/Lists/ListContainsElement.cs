﻿using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard/Lists"),
     Description("Check if an element is contained in the target list")]
    public class ListContainsElement<T> : ConditionTask
    {
        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        public BBParameter<T> checkElement;
        protected override string info => targetList + " contains " + checkElement;
        protected override bool OnCheck() => targetList.value.Contains(checkElement.value);
    }
}
