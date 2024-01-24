#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("GameObject"), Description("A combination of line of sight and view angle check")]
    public class CanSeeTarget : ConditionTask<Transform>
    {
        [Tooltip(
            "Distance within which the target can be seen (or rather sensed) regardless of view angle.")]
        public BBParameter<float> awarnessDistance = 0f;

        private RaycastHit hit;

        [Tooltip("A layer mask to use for line of sight check.")]
        public BBParameter<LayerMask> layerMask = (LayerMask)(-1);

        [Tooltip("Distance within which to look out for.")]
        public BBParameter<float> maxDistance = 50;

        public Vector3 offset;

        [RequiredField]
        public BBParameter<GameObject> target;

        [SliderField(1, 180)]
        public BBParameter<float> viewAngle = 70f;

        protected override string info => "Can See " + target;

        protected override bool OnCheck()
        {
            var t = target.value.transform;
            if (!t.gameObject.activeInHierarchy) return false;

            if (Vector3.Distance(agent.position, t.position) <= awarnessDistance.value) {
                if (Physics.Linecast(agent.position + offset, t.position + offset, out hit,
                    layerMask.value))
                    if (hit.collider != t.GetComponent<Collider>())
                        return false;
                return true;
            }
            if (Vector3.Distance(agent.position, t.position) > maxDistance.value) return false;
            if (Vector3.Angle(t.position - agent.position, agent.forward) > viewAngle.value)
                return false;
            if (Physics.Linecast(agent.position + offset, t.position + offset, out hit,
                layerMask.value))
                if (hit.collider != t.GetComponent<Collider>())
                    return false;
            return true;
        }

        public override void OnDrawGizmosSelected()
        {
            if (agent != null) {
                Gizmos.DrawLine(agent.position, agent.position + offset);
                Gizmos.DrawLine(agent.position + offset,
                    agent.position + offset + agent.forward * maxDistance.value);
                Gizmos.DrawWireSphere(agent.position + offset + agent.forward * maxDistance.value,
                    0.1f);
                Gizmos.DrawWireSphere(agent.position, awarnessDistance.value);
                Gizmos.matrix = Matrix4x4.TRS(agent.position + offset, agent.rotation, Vector3.one);
                Gizmos.DrawFrustum(Vector3.zero, viewAngle.value, 5, 0, 1f);
            }
        }
    }
}
