#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class AddElementToList<T> : ActionTask
    {
        public BBParameter<T> targetElement;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override string info =>
                string.Format("Add {0} In {1}", targetElement, targetList);

        protected override void OnExecute()
        {
            targetList.value.Add(targetElement.value);
            EndAction();
        }
    }
}
