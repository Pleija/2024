#region
using System;
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Attachable(typeof(ActorActionTrack))]
    public abstract class ActorActionClip : ActionClip { }

    [Attachable(typeof(ActorActionTrack))]
    ///<summary>The .actor property of the generic ActorActionClip version, returns the T argument component directly</summary>
    public abstract class ActorActionClip<T> : ActionClip where T : Component
    {
        [NonSerialized]
        private T _actorComponent;

        public new T actor {
            get {
                if (_actorComponent != null) return _actorComponent;
                return _actorComponent =
                        base.actor != null ? base.actor.GetComponentInChildren<T>() : null;
                /*
                if ( _actorComponent != null && _actorComponent.gameObject == base.actor ) {
                    return _actorComponent;
                }
                return _actorComponent = base.actor != null ? base.actor.GetComponent<T>() : null;
                */
            }
        }

        public override bool isValid => actor != null;
    }
}
