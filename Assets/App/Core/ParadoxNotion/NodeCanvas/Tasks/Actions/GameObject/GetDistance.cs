#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject")]
    public class GetDistance : ActionTask<Transform>
    {
        [BlackboardOnly]
        public BBParameter<float> saveAs;

        [RequiredField]
        public BBParameter<GameObject> target;

        protected override string info => string.Format("Get Distance to {0}", target);

        protected override void OnExecute()
        {
            saveAs.value = Vector3.Distance(agent.position, target.value.transform.position);
            EndAction();
        }
    }
}
