#region
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Description(
         "Animate any number of properties on any component of the actor, or within it's hierarchy.\nYou can use the clip's Blend In/Out to optionally smooth blend from current property values over to the keyframed ones and back."),
     Attachable(typeof(ActorActionTrack), typeof(DirectorActionTrack))]
    public class AnimateProperties : ActionClip
    {
        [SerializeField, HideInInspector]
        private float _length = 5f;

        [SerializeField, HideInInspector]
        private float _blendIn;

        [SerializeField, HideInInspector]
        private float _blendOut;

        [SerializeField]
        protected string _name;

        public EaseType interpolation = EaseType.QuadraticInOut;

        public override float length {
            get => _length;
            set => _length = value;
        }

        public override float blendIn {
            get => _blendIn;
            set => _blendIn = value;
        }

        public override float blendOut {
            get => _blendOut;
            set => _blendOut = value;
        }

        public override bool isValid => //valid when there is at least 1 parameter added.
                animationData != null && animationData.isValid;

        public override string info => isValid
                ? string.IsNullOrEmpty(_name) ? animationData.ToString() : _name
                : "No Properties Added";

        //By default the target is the actionclip instance. In this case, the target is the actor.
        //This also makes the clip eligable for manual parameters registration which is done here.
        public override object animatedParametersTarget => actor;

        //The interpolation to use for the animated paramters blend in and out.
        public override EaseType animatedParametersInterpolation => interpolation;

        //We want the clip weight to automatically be used in parameters.
        public override bool useWeightInParameters => true;

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnSceneGUI()
        {
            if (!isValid) return;

            for (var i = 0; i < animationData.animatedParameters.Count; i++) {
                var animParam = animationData.animatedParameters[i];

                if (animParam.parameterName == "localPosition") {
                    var transform = animParam.ResolvedMemberObject() as Transform;

                    if (transform != null) {
                        var context = transform.parent != null ? transform.parent
                                : GetSpaceTransform(TransformSpace.CutsceneSpace);
                        CurveEditor3D.Draw3DCurve(animParam, this, context, length / 2, length);
                    }
                }
            }
        }

#endif
    }
}
