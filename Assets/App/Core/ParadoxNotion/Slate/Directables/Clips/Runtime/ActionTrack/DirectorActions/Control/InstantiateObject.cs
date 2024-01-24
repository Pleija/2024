#region
using UnityEngine;
using UnityEngine.SceneManagement;
#endregion

namespace Slate.ActionClips
{
    [Category("Control"),
     Description(
         "Instantiates an object with optional popup animation if BlendIn is higher than zero. You can optionaly 'popdown' and destroy the object after a period of time, if you also set a BlendOut value higher than zero.")]
    public class InstantiateObject : DirectorActionClip
    {
        [SerializeField, HideInInspector]
        private float _length = 2f;

        [SerializeField, HideInInspector]
        private float _blendIn;

        [SerializeField, HideInInspector]
        private float _blendOut;

        [PlaybackProtected]
        public GameObject targetObject;

        public Transform optionalParent;
        public Vector3 targetPosition;
        public Vector3 targetRotation;
        public MiniTransformSpace space;
        public EaseType popupInterpolation = EaseType.ElasticInOut;
        private Vector3 wasScale;
        public override bool isValid => targetObject != null;

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

        public override string info => string.Format("Instantiate\n{0}",
            targetObject != null ? targetObject.name : "NULL");

        private new GameObject actor { get; set; }

        protected override void OnEnter()
        {
            wasScale = targetObject.transform.localScale;
            actor = Instantiate(targetObject);
            SceneManager.MoveGameObjectToScene(actor,
                optionalParent != null ? optionalParent.gameObject.scene : root.context.scene);
            actor.transform.parent = optionalParent;

            // instance.transform.position = TransformPosition(targetPosition, (TransformSpace)space);
            // instance.transform.rotation = TransformRotation(targetRotation, (TransformSpace)space);

            //REMARK: This is a special case since the created instance is not the actor of this clip (since it's a Director Clip),
            //but we need to do transformations based on the instance. This is relevant only for Parent Space.
            var spaceTransform = GetSpaceTransform((TransformSpace)space, actor);
            actor.transform.position = spaceTransform != null
                    ? spaceTransform.TransformPoint(targetPosition) : targetPosition;
            actor.transform.rotation = spaceTransform != null
                    ? spaceTransform.rotation * Quaternion.Euler(targetRotation)
                    : Quaternion.Euler(targetRotation);
        }

        protected override void OnUpdate(float time)
        {
            if (actor != null)
                actor.transform.localScale = Easing.Ease(popupInterpolation, Vector3.zero, wasScale,
                    GetClipWeight(time));
        }

        protected override void OnExit()
        {
            if (blendOut > 0) DestroyImmediate(actor, false);
        }

        protected override void OnReverseEnter()
        {
            if (blendOut > 0) OnEnter();
        }

        protected override void OnReverse()
        {
            DestroyImmediate(actor, false);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnSceneGUI()
        {
            if (optionalParent == null) {
                DoVectorPositionHandle((TransformSpace)space, targetRotation, ref targetPosition);
                DoVectorRotationHandle((TransformSpace)space, targetPosition, ref targetRotation);
            }
        }

#endif
    }
}
