#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Play Animation"), Category("Animator")]
    public class MecanimPlayAnimation : ActionTask<Animator>
    {
        public BBParameter<int> layerIndex;
        private bool played;
        private AnimatorStateInfo stateInfo;

        [RequiredField]
        public BBParameter<string> stateName;

        [SliderField(0, 1)]
        public float transitTime = 0.25f;

        public bool waitUntilFinish;
        protected override string info => "Anim '" + stateName + "'";

        protected override void OnExecute()
        {
            if (string.IsNullOrEmpty(stateName.value)) {
                EndAction();
                return;
            }
            played = false;
            var current = agent.GetCurrentAnimatorStateInfo(layerIndex.value);
            agent.CrossFade(stateName.value, transitTime / current.length, layerIndex.value, 0, 0);
        }

        protected override void OnUpdate()
        {
            stateInfo = agent.GetCurrentAnimatorStateInfo(layerIndex.value);

            if (waitUntilFinish) {
                if (stateInfo.IsName(stateName.value)) {
                    played = true;
                    if (elapsedTime >= stateInfo.length / agent.speed) EndAction();
                }
                else if (played) {
                    EndAction();
                }
            }
            else {
                if (elapsedTime >= transitTime) EndAction();
            }
        }
    }
}
