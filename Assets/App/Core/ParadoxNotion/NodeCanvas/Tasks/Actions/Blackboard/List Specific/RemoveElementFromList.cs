#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists"), Description("Remove an element from the target list")]
    public class RemoveElementFromList<T> : ActionTask
    {
        public BBParameter<T> targetElement;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override string info =>
                string.Format("Remove {0} From {1}", targetElement, targetList);

        protected override void OnExecute()
        {
            targetList.value.Remove(targetElement.value);
            EndAction(true);
        }
    }
}
