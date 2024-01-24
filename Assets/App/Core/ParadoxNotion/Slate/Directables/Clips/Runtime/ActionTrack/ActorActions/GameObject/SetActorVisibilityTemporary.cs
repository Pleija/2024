#region
using System;
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Category("GameObject"), Obsolete("Use 'Set Actor Visibility'")]
    public class SetActorVisibilityTemporary : ActorActionClip
    {
        [SerializeField, HideInInspector]
        private float _length = 1f;

        public ActiveState activeState = ActiveState.Enable;
        private bool currentState;
        private bool lastState;
        private bool temporary;

        public override float length {
            get => _length;
            set => _length = value;
        }

        public override string info => string.Format("{0} Actor", activeState);

        protected override void OnEnter()
        {
            lastState = actor.activeSelf;
            if (activeState == ActiveState.Toggle)
                actor.SetActive(!actor.activeSelf);
            else
                actor.SetActive(activeState == ActiveState.Enable);
            currentState = actor.activeSelf;
            temporary = length > 0;
        }

        protected override void OnExit()
        {
            if (temporary) actor.SetActive(!currentState);
        }

        protected override void OnReverseEnter()
        {
            if (temporary) actor.SetActive(currentState);
        }

        protected override void OnReverse()
        {
            actor.SetActive(lastState);
        }
    }
}
