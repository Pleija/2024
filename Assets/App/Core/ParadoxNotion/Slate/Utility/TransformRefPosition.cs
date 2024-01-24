#region
using System;
using UnityEngine;
using UnityEngine.Serialization;
#endregion

namespace Slate
{
    ///<summary>An easy way to allow the user in the inspector to choose a Transform or a Vector3</summary>
    [Serializable]
    public struct TransformRefPosition : ITransformRefParameter
    {
        [SerializeField, ActorGroupPopup]
        private CutsceneGroup _group;

        [SerializeField, FormerlySerializedAs("transform")]
        private Transform _transform;

        [SerializeField, FormerlySerializedAs("vector")]
        private Vector3 _vector;

        [SerializeField]
        private TransformSpace _space;

        public CutsceneGroup group {
            get => _group;
            set => _group = value;
        }

        public Vector3 value {
            get => !useAnimation ? transform.position : _vector;
            set => _vector = value;
        }

        public bool useAnimation => (_group == null || _group.actor == null) && _transform == null;

        public Transform transform {
            get {
                if (group != null) return group.actor != null ? group.actor.transform : null;
                return _transform;
            }
            set => _transform = value;
        }

        public TransformSpace space {
            get => !useAnimation ? TransformSpace.WorldSpace : _space;
            private set => _space = value;
        }

        public override string ToString() =>
                transform != null ? transform.name : _vector.ToString();
    }
}
