#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class SetListElement<T> : ActionTask
    {
        public BBParameter<int> index;
        public BBParameter<T> newValue;

        [RequiredField, BlackboardOnly]
        public BBParameter<List<T>> targetList;

        protected override void OnExecute()
        {
            if (index.value < 0 || index.value >= targetList.value.Count) {
                EndAction(false);
                return;
            }
            targetList.value[index.value] = newValue.value;
            EndAction(true);
        }
    }
}
