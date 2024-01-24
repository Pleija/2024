#region
using System.Collections;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class GetListCount : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<int> saveAs;

        [RequiredField, BlackboardOnly]
        public BBParameter<IList> targetList;

        protected override string info => string.Format("{0} = {1}.Count", saveAs, targetList);

        protected override void OnExecute()
        {
            saveAs.value = targetList.value.Count;
            EndAction(true);
        }
    }
}
