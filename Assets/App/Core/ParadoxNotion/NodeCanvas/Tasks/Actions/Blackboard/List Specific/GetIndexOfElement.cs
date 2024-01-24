#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class GetIndexOfElement<T> : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<int> saveIndexAs;

        public BBParameter<T> targetElement;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override void OnExecute()
        {
            saveIndexAs.value = targetList.value.IndexOf(targetElement.value);
            EndAction(true);
        }
    }
}
