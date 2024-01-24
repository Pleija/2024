#region
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Category("GameObject"), Description("Set or animate the actor gameobject visibility.")]
    public class AnimateActorVisibility : ActorActionClip
    {
        [SerializeField, HideInInspector]
        private float _length = 1;

        [AnimatableParameter]
        public bool visible;

        private bool wasVisible;

        public override float length {
            get => _length;
            set => _length = value;
        }

        protected override void OnCreate()
        {
            visible = actor.activeSelf;
        }

        protected override void OnEnter()
        {
            wasVisible = actor.activeSelf;
        }

        protected override void OnUpdate(float time)
        {
            actor.SetActive(visible);
        }

        protected override void OnReverse()
        {
            actor.SetActive(wasVisible);
        }
    }
}
