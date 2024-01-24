#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Physics")]
    public class GetLinecastInfo : ActionTask<Transform>
    {
        private RaycastHit hit;
        public BBParameter<LayerMask> layerMask = (LayerMask)(-1);

        [BlackboardOnly]
        public BBParameter<float> saveDistanceAs;

        [BlackboardOnly]
        public BBParameter<GameObject> saveHitGameObjectAs;

        [BlackboardOnly]
        public BBParameter<Vector3> saveNormalAs;

        [BlackboardOnly]
        public BBParameter<Vector3> savePointAs;

        [RequiredField]
        public BBParameter<GameObject> target;

        protected override void OnExecute()
        {
            if (Physics.Linecast(agent.position, target.value.transform.position, out hit,
                layerMask.value)) {
                saveHitGameObjectAs.value = hit.collider.gameObject;
                saveDistanceAs.value = hit.distance;
                savePointAs.value = hit.point;
                saveNormalAs.value = hit.normal;
                EndAction(true);
                return;
            }
            EndAction(false);
        }

        public override void OnDrawGizmosSelected()
        {
            if (agent && target.value)
                Gizmos.DrawLine(agent.position, target.value.transform.position);
        }
    }
}
