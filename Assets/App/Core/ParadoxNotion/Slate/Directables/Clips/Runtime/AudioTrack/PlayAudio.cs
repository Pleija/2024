#region
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Name("Audio Clip"),
     Description(
         "The audio clip will be send to the AudioMixer selected in it's track if any. You can trim or loop the audio by scaling the clip and you can optionaly show subtitles as well."),
     Attachable(typeof(ActorAudioTrack), typeof(DirectorAudioTrack))]
    public class PlayAudio : ActionClip, ISubClipContainable
    {
        [SerializeField, HideInInspector]
        private float _length = 1f;

        [SerializeField, HideInInspector]
        private float _blendIn = 0.25f;

        [SerializeField, HideInInspector]
        private float _blendOut = 0.25f;

        [Required]
        public AudioClip audioClip;

        public float clipOffset;

        [AnimatableParameter(0, 1)]
        public float volume = 1;

        [AnimatableParameter(-3, 3)]
        public float pitch = 1;

        [AnimatableParameter(-1, 1)]
        public float stereoPan;

        [Multiline(5)]
        public string subtitlesText;

        public Color subtitlesColor = Color.white;

        public override float length {
            get => _length;
            set => _length = value;
        }

        public override bool isValid => audioClip != null;

        public override string info => isValid
                ? string.IsNullOrEmpty(subtitlesText) ? audioClip.name
                        : string.Format("<i>'{0}'</i>", subtitlesText) : base.info;

        private AudioTrack track => (AudioTrack)parent;
        private AudioSource source => track.source;

        float ISubClipContainable.subClipOffset {
            get => clipOffset;
            set => clipOffset = value;
        }

        float ISubClipContainable.subClipLength => audioClip != null ? audioClip.length : 0;
        float ISubClipContainable.subClipSpeed => 1;

        public override float blendIn {
            get => _blendIn;
            set => _blendIn = value;
        }

        public override float blendOut {
            get => _blendOut;
            set => _blendOut = value;
        }

        protected override void OnEnter()
        {
            Do();
        }

        protected override void OnReverseEnter()
        {
            Do();
        }

        protected override void OnExit()
        {
            Undo();
        }

        protected override void OnReverse()
        {
            Undo();
        }

        private void Do()
        {
            if (source != null) source.clip = audioClip;
        }

        protected override void OnUpdate(float time, float previousTime)
        {
            if (source != null) {
                var weight = Easing.Ease(EaseType.QuadraticInOut, 0, 1, GetClipWeight(time));
                var settings = track.sampleSettings;
                settings.volume *= weight * volume;
                settings.pitch *= pitch * root.playbackSpeed;
                settings.pan += stereoPan;
                AudioSampler.Sample(source, audioClip, time - clipOffset, previousTime - clipOffset,
                    settings);

                if (!string.IsNullOrEmpty(subtitlesText)) {
                    var lerpColor = subtitlesColor;
                    lerpColor.a = weight;
                    DirectorGUI.UpdateSubtitles(string.Format("{0}{1}",
                        parent is ActorAudioTrack ? actor.name.Replace("(Clone)", "") + ": "
                                : "", subtitlesText), lerpColor);
                }
            }
        }

        private void Undo()
        {
            if (source != null) source.clip = null;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnClipGUI(Rect rect)
        {
            EditorTools.DrawLoopedAudioTexture(rect, audioClip, length, clipOffset);
        }

#endif
    }
}
