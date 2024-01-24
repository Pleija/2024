#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard/Lists"),
     Description("Check if an element is contained in the target list")]
    public class ListContainsElement<T> : ConditionTask
    {
        public BBParameter<T> checkElement;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override string info => targetList + " contains " + checkElement;
        protected override bool OnCheck() => targetList.value.Contains(checkElement.value);
    }
}
