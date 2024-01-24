#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Set IK"), Category("Animator")]
    public class MecanimSetIK : ActionTask<Animator>
    {
        [RequiredField]
        public BBParameter<GameObject> goal;

        public AvatarIKGoal IKGoal;
        public BBParameter<float> weight;
        protected override string info => "Set '" + IKGoal + "' " + goal;

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
            agent.SetIKPositionWeight(IKGoal, weight.value);
            agent.SetIKPosition(IKGoal, goal.value.transform.position);
            EndAction();
        }
    }
}
