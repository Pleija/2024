#region
using UnityEngine;
#endregion

namespace Slate
{
    [Attachable(typeof(ActorGroup))]
    public class ActorAudioTrack : AudioTrack
    {
        [SerializeField]
        protected bool _useAudioSourceOnActor;

        public override bool useAudioSourceOnActor => _useAudioSourceOnActor;
    }
}
