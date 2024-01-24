#region
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Name("Animation Clip"),
     Description(
         "All animation clips in the same track, will play at an animation layer equal to their track layer order. Thus, animations in tracks on top will play over animations in tracks bellow. You can trim or loop the animation by scaling the clip."),
     Attachable(typeof(AnimationTrack))]
    public class PlayAnimationClip : ActorActionClip<Animation>, ISubClipContainable
    {
        [SerializeField, HideInInspector]
        private float _length = 1f;

        [SerializeField, HideInInspector]
        private float _blendIn;

        [SerializeField, HideInInspector]
        private float _blendOut;

        [Required]
        public AnimationClip animationClip;

        public float clipOffset;

        [Range(0.1f, 5)]
        public float playbackSpeed = 1;

        private bool isListClip;
        private Transform mixTransform;
        private TransformSnapshot snapShot;
        private AnimationState state;
        public override string info => animationClip ? animationClip.name : base.info;

        public override bool isValid =>
                base.isValid && animationClip != null && animationClip.legacy;

        public override float length {
            get => _length;
            set => _length = value;
        }

        private AnimationTrack track => (AnimationTrack)parent;

        float ISubClipContainable.subClipOffset {
            get => clipOffset;
            set => clipOffset = value;
        }

        float ISubClipContainable.subClipLength => animationClip != null ? animationClip.length : 0;
        float ISubClipContainable.subClipSpeed => playbackSpeed;

        public override float blendIn {
            get => _blendIn;
            set => _blendIn = value;
        }

        public override float blendOut {
            get => _blendOut;
            set => _blendOut = value;
        }

        public override bool canCrossBlend => true;

        protected override void OnEnter()
        {
            snapShot = new TransformSnapshot(actor.gameObject,
                TransformSnapshot.StoreMode.ChildrenOnly);
            isListClip = actor[animationClip.name] != null;
            if (!isListClip) actor.AddClip(animationClip, animationClip.name);
            mixTransform = track.GetMixTransform();
            if (mixTransform != null)
                actor[animationClip.name].AddMixingTransform(mixTransform, true);
        }

        protected override void OnUpdate(float time)
        {
            state = actor[animationClip.name];
            state.time = time * playbackSpeed;
            var animLength = animationClip.length / playbackSpeed;

            if (length <= animLength) {
                state.wrapMode = WrapMode.Once;
                state.time = Mathf.Min(state.time - clipOffset, animationClip.length);
            }

            if (length > animLength) {
                if (animationClip.wrapMode == WrapMode.PingPong) {
                    state.wrapMode = WrapMode.PingPong;
                    state.time = Mathf.PingPong(state.time - clipOffset, animationClip.length);
                }
                else {
                    state.wrapMode = WrapMode.Loop;
                    state.time = Mathf.Repeat(state.time - clipOffset, animationClip.length);
                }
            }
            state.layer =
                    track.layerOrder
                    + 11; //Play animations on layer 11+ for all the play animation action clips
            state.weight = GetClipWeight(time) * track.GetTrackWeight();
            state.blendMode = track.animationBlendMode;
            state.enabled = true;
            actor.Sample();
        }

        protected override void OnReverse()
        {
            snapShot.Restore();
            state.enabled = false;
            if (!isListClip) actor.RemoveClip(animationClip);
        }

        protected override void OnExit()
        {
            state.enabled = false;
        }

        protected override void OnReverseEnter()
        {
            state.enabled = true;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnClipGUI(Rect rect)
        {
            if (animationClip != null)
                EditorTools.DrawLoopedLines(rect, animationClip.length / playbackSpeed, length,
                    clipOffset);
        }

#endif
    }
}
