#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Animation")]
    public class PlayAnimationAdvanced : ActionTask<Animation>
    {
        [RequiredField]
        public BBParameter<AnimationClip> animationClip;

        public BBParameter<int> animationLayer;
        private string animationToPlay = string.Empty;
        public WrapMode animationWrap;
        public AnimationBlendMode blendMode;

        [SliderField(0, 1)]
        public float crossFadeTime = 0.25f;

        private int dir = -1;
        private Transform mixTransform;
        public BBParameter<string> mixTransformName;

        [SliderField(0, 2)]
        public float playbackSpeed = 1;

        public PlayDirections playDirection = PlayDirections.Forward;
        public bool queueAnimation;
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
            if (playDirection == PlayDirections.Toggle) dir = -dir;
            if (playDirection == PlayDirections.Backward) dir = -1;
            if (playDirection == PlayDirections.Forward) dir = 1;
            agent.AddClip(animationClip.value, animationClip.value.name);
            animationToPlay = animationClip.value.name;

            if (!string.IsNullOrEmpty(mixTransformName.value)) {
                mixTransform = FindTransform(agent.transform, mixTransformName.value);
                if (!mixTransform)
                    Logger.LogWarning("Cant find transform with name '"
                        + mixTransformName.value
                        + "' for PlayAnimation Action", LogTag.EXECUTION, this);
            }
            else {
                mixTransform = null;
            }
            animationToPlay = animationClip.value.name;
            if (mixTransform) agent[animationToPlay].AddMixingTransform(mixTransform, true);
            agent[animationToPlay].layer = animationLayer.value;
            agent[animationToPlay].speed = dir * playbackSpeed;
            agent[animationToPlay].normalizedTime = Mathf.Clamp01(-dir);
            agent[animationToPlay].wrapMode = animationWrap;
            agent[animationToPlay].blendMode = blendMode;
            if (queueAnimation)
                agent.CrossFadeQueued(animationToPlay, crossFadeTime);
            else
                agent.CrossFade(animationToPlay, crossFadeTime);
            if (!waitActionFinish) EndAction(true);
        }

        protected override void OnUpdate()
        {
            if (elapsedTime >= agent[animationToPlay].length / playbackSpeed - crossFadeTime)
                EndAction(true);
        }

        private Transform FindTransform(Transform parent, string name)
        {
            if (parent.name == name) return parent;
            var transforms = parent.GetComponentsInChildren<Transform>();
            foreach (var t in transforms)
                if (t.name == name)
                    return t;
            return null;
        }
    }
}
