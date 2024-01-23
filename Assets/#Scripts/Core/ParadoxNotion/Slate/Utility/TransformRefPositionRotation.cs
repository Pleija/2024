using UnityEngine;

namespace Slate
{
    [System.Serializable]
    public struct TransformRefPositionRotation : ITransformRefParameter
    {
        [SerializeField, ActorGroupPopup]
        private CutsceneGroup _group;

        [SerializeField]
        private Transform _transform;

        [SerializeField]
        private Vector3 _position;

        [SerializeField]
        private Vector3 _rotation;

        [SerializeField]
        private TransformSpace _space;

        public bool useAnimation => (_group == null || _group.actor == null) && _transform == null;

        public CutsceneGroup group {
            get => _group;
            set => _group = value;
        }

        public Transform transform {
            get {
                if (group != null) return group.actor != null ? group.actor.transform : null;
                return _transform;
            }
            set => _transform = value;
        }

        public Vector3 position {
            get => !useAnimation ? transform.position : _position;
            set => _position = value;
        }

        public Vector3 rotation {
            get => !useAnimation ? transform.eulerAngles : _rotation;
            set => _rotation = value;
        }

        public TransformSpace space {
            get => !useAnimation ? TransformSpace.WorldSpace : _space;
            private set => _space = value;
        }

        public override string ToString() => transform != null ? transform.name
            : string.Format("{0}\n{1}", _position.ToString(), _rotation.ToString());
    }
}
