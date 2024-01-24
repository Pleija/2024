#region
using UnityEngine;
#endregion

namespace Runner.Characters
{
    public class RandomAnimation : StateMachineBehaviour
    {
        public string parameter;
        public int count;

        public override void OnStateEnter(Animator animator, AnimatorStateInfo stateInfo,
            int layerIndex)
        {
            animator.SetInteger(parameter, Random.Range(0, count));
        }
    }
}
