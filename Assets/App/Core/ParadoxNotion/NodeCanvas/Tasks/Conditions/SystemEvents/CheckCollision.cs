#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("System Events"), Name("Check Collision")]
    public class CheckCollision_Rigidbody : ConditionTask<Rigidbody>
    {
        public CollisionTypes checkType = CollisionTypes.CollisionEnter;

        [TagField]
        public string objectTag = "Untagged";

        [BlackboardOnly]
        public BBParameter<Vector3> saveContactNormal;

        [BlackboardOnly]
        public BBParameter<Vector3> saveContactPoint;

        [BlackboardOnly]
        public BBParameter<GameObject> saveGameObjectAs;

        public bool specifiedTagOnly;
        private bool stay;

        protected override string info =>
                checkType + (specifiedTagOnly ? " '" + objectTag + "' tag" : "");

        protected override void OnEnable()
        {
            router.onCollisionEnter += OnCollisionEnter;
            router.onCollisionExit += OnCollisionExit;
        }

        protected override void OnDisable()
        {
            router.onCollisionEnter -= OnCollisionEnter;
            router.onCollisionExit -= OnCollisionExit;
        }

        protected override bool OnCheck() =>
                checkType == CollisionTypes.CollisionStay ? stay : false;

        public void OnCollisionEnter(EventData<Collision> data)
        {
            if (!specifiedTagOnly || data.value.gameObject.CompareTag(objectTag)) {
                stay = true;

                if (checkType == CollisionTypes.CollisionEnter
                    || checkType == CollisionTypes.CollisionStay) {
                    saveGameObjectAs.value = data.value.gameObject;
                    saveContactPoint.value = data.value.contacts[0].point;
                    saveContactNormal.value = data.value.contacts[0].normal;
                    YieldReturn(true);
                }
            }
        }

        public void OnCollisionExit(EventData<Collision> data)
        {
            if (!specifiedTagOnly || data.value.gameObject.CompareTag(objectTag)) {
                stay = false;

                if (checkType == CollisionTypes.CollisionExit) {
                    saveGameObjectAs.value = data.value.gameObject;
                    YieldReturn(true);
                }
            }
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Category("System Events"), DoNotList]
    public class CheckCollision : ConditionTask<Collider>
    {
        public CollisionTypes checkType = CollisionTypes.CollisionEnter;

        [TagField]
        public string objectTag = "Untagged";

        [BlackboardOnly]
        public BBParameter<Vector3> saveContactNormal;

        [BlackboardOnly]
        public BBParameter<Vector3> saveContactPoint;

        [BlackboardOnly]
        public BBParameter<GameObject> saveGameObjectAs;

        public bool specifiedTagOnly;
        private bool stay;

        protected override string info =>
                checkType + (specifiedTagOnly ? " '" + objectTag + "' tag" : "");

        protected override void OnEnable()
        {
            router.onCollisionEnter += OnCollisionEnter;
            router.onCollisionExit += OnCollisionExit;
        }

        protected override void OnDisable()
        {
            router.onCollisionEnter -= OnCollisionEnter;
            router.onCollisionExit -= OnCollisionExit;
        }

        protected override bool OnCheck() =>
                checkType == CollisionTypes.CollisionStay ? stay : false;

        public void OnCollisionEnter(EventData<Collision> data)
        {
            if (!specifiedTagOnly || data.value.gameObject.CompareTag(objectTag)) {
                stay = true;

                if (checkType == CollisionTypes.CollisionEnter
                    || checkType == CollisionTypes.CollisionStay) {
                    saveGameObjectAs.value = data.value.gameObject;
                    saveContactPoint.value = data.value.contacts[0].point;
                    saveContactNormal.value = data.value.contacts[0].normal;
                    YieldReturn(true);
                }
            }
        }

        public void OnCollisionExit(EventData<Collision> data)
        {
            if (!specifiedTagOnly || data.value.gameObject.CompareTag(objectTag)) {
                stay = false;

                if (checkType == CollisionTypes.CollisionExit) {
                    saveGameObjectAs.value = data.value.gameObject;
                    YieldReturn(true);
                }
            }
        }
    }
}
