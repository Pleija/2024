#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard/Lists")]
    public class PickRandomListElement<T> : ActionTask
    {
        public BBParameter<T> saveAs;

        [RequiredField]
        public BBParameter<List<T>> targetList;

        protected override string info =>
                string.Format("{0} = Random From {1}", saveAs, targetList);

        protected override void OnExecute()
        {
            if (targetList.value.Count <= 0) {
                EndAction(false);
                return;
            }
            saveAs.value = targetList.value[Random.Range(0, targetList.value.Count)];
            EndAction(true);
        }
    }
}
