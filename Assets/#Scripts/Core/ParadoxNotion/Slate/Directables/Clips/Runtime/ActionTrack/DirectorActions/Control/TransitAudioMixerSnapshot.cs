using UnityEngine;
using UnityEngine.Audio;

namespace Slate.ActionClips
{
    [Category("Control"), Description("Will transit the given audio mixer to the given snapshot")]
    public class TransitAudioMixerSnapshot : DirectorActionClip
    {
        [SerializeField, HideInInspector]
        private float _length = 1f;

        public AudioMixer audioMixer;
        public string snapshotName;
        private AudioMixerSnapshot snapshot;

        public override float length {
            get => _length;
            set => _length = value;
        }

        public override float blendIn => length;
        public override bool isValid => audioMixer != null;

        protected override void OnReverseEnter()
        {
            Do();
        }

        protected override void OnEnter()
        {
            Do();
        }

        private void Do()
        {
            var snapshot = audioMixer.FindSnapshot(snapshotName);
            if (snapshot != null) snapshot.TransitionTo(length);
        }
    }
}
