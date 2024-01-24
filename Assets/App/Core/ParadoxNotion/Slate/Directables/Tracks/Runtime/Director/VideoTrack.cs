#if UNITY_2017_2_OR_NEWER

#region
using UnityEngine;
using UnityEngine.Video;
#endregion

namespace Slate
{
    [Attachable(typeof(DirectorGroup)), Icon(typeof(VideoPlayer)),
     Description(
         "Plays video clips on the render camera. Please note that scrubbing might be choppy, but playing is not.")]
    public class VideoTrack : CutsceneTrack
    {
        public VideoSampler.VideoRenderTarget renderTarget;

        [ShowIf(nameof(renderTarget), 3)]
        public Renderer targetMaterialRenderer;

        public VideoAspectRatio aspectRatio = VideoAspectRatio.FitHorizontally;

        [Range(0, 1), Tooltip("Alpha only works with Camera render target.")]
        public float targetCameraAlpha = 1f;

        public VideoPlayer source { get; private set; }

        public override string info => string.Format("{0} | {1} {2}", renderTarget,
            targetMaterialRenderer != null ? targetMaterialRenderer.name : string.Empty,
            targetCameraAlpha);

        protected override void OnEnter()
        {
            Enable();
        }

        protected override void OnReverseEnter()
        {
            Enable();
        }

        protected override void OnReverse()
        {
            Disable();
        }

        protected override void OnExit()
        {
            Disable();
        }

        private void Enable()
        {
            source = VideoSampler.GetSourceForID(this);
            source.Prepare();
        }

        private void Disable()
        {
            VideoSampler.ReleaseSourceForID(this);
        }
    }
}

#endif
