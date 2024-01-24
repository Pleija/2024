#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class InsertElementToList<T> : ActionTask
    {
        public BBParameter<T> targetElement;
        public BBParameter<int> targetIndex;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override string info => string.Format("Insert {0} in {1} at {2}", targetElement,
            targetList, targetIndex);

        protected override void OnExecute()
        {
            var index = targetIndex.value;
            var list = targetList.value;

            if (index < 0 || index >= list.Count) {
                EndAction(false);
                return;
            }
            list.Insert(index, targetElement.value);
            EndAction(true);
        }
    }
}
