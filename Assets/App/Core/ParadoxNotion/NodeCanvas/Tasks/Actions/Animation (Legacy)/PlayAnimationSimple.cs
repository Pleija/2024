#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Animation")]
    public class PlayAnimationSimple : ActionTask<Animation>
    {
        //holds the last played animationClip.value for each agent 
        private static Dictionary<Animation, AnimationClip> lastPlayedClips =
                new Dictionary<Animation, AnimationClip>();

        [RequiredField]
        public BBParameter<AnimationClip> animationClip;

        public WrapMode animationWrap = WrapMode.Loop;

        [SliderField(0, 1)]
        public float crossFadeTime = 0.25f;

        public bool waitActionFinish = true;
        protected override string info => "Anim " + animationClip;

        protected override string OnInit()
        {
            agent.AddClip(animationClip.value, animationClip.value.name);
            animationClip.value.legacy = true;
            return null;
        }

        protected override void OnExecute()
        {
            AnimationClip last = null;

            if (lastPlayedClips.TryGetValue(agent, out last) && last == animationClip.value) {
                EndAction(true);
                return;
            }
            lastPlayedClips[agent] = animationClip.value;
            agent[animationClip.value.name].wrapMode = animationWrap;
            agent.CrossFade(animationClip.value.name, crossFadeTime);
            if (!waitActionFinish) EndAction(true);
        }

        protected override void OnUpdate()
        {
            if (elapsedTime >= animationClip.value.length - crossFadeTime) EndAction(true);
        }
    }
}
