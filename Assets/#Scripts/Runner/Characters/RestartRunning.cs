using Runner.Tracks;
using UnityEngine;

namespace Runner.Characters
{
    public class RestartRunning : StateMachineBehaviour
    {
        private static int s_DeadHash = Animator.StringToHash("Dead");

        public override void OnStateExit(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
        {
            // We don't restart if we go toward the death state
            if (animator.GetBool(s_DeadHash))
                return;
            TrackManager.instance.StartMove();
        }
    }
}
