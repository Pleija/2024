#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Set Look At"), Category("Animator")]
    public class MecanimSetLookAt : ActionTask<Animator>
    {
        public BBParameter<GameObject> targetPosition;
        public BBParameter<float> targetWeight;
        protected override string info => "Mec.SetLookAt " + targetPosition;

        protected override void OnExecute()
        {
            router.onAnimatorIK += OnAnimatorIK;
        }

        protected override void OnStop()
        {
            router.onAnimatorIK -= OnAnimatorIK;
        }

        private void OnAnimatorIK(EventData<int> msg)
        {
            agent.SetLookAtPosition(targetPosition.value.transform.position);
            agent.SetLookAtWeight(targetWeight.value);
            EndAction();
        }
    }
}
