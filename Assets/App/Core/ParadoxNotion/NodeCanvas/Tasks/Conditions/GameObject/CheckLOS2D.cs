#region
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Name("Target In Line Of Sight 2D"), Category("GameObject"),
     Description(
         "Check of agent is in line of sight with target by doing a linecast and optionaly save the distance")]
    public class CheckLOS2D : ConditionTask<Transform>
    {
        [GetFromAgent]
        protected Collider2D agentCollider;

        private RaycastHit2D[] hits;
        public BBParameter<LayerMask> layerMask = (LayerMask)(-1);

        [RequiredField]
        public BBParameter<GameObject> LOSTarget;

        [BlackboardOnly]
        public BBParameter<float> saveDistanceAs;

        protected override string info => "LOS with " + LOSTarget;

        protected override bool OnCheck()
        {
            hits = Physics2D.LinecastAll(agent.position, LOSTarget.value.transform.position,
                layerMask.value);
            foreach (var collider in hits.Select(h => h.collider))
                if (collider != agentCollider
                    && collider != LOSTarget.value.GetComponent<Collider2D>())
                    return false;
            return true;
        }

        public override void OnDrawGizmosSelected()
        {
            if (agent && LOSTarget.value)
                Gizmos.DrawLine((Vector2)agent.position,
                    (Vector2)LOSTarget.value.transform.position);
        }
    }
}
