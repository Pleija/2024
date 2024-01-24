#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
using NavMesh = UnityEngine.AI.NavMesh;
using NavMeshHit = UnityEngine.AI.NavMeshHit;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Find Closest NavMesh Edge"), Category("Movement/Pathfinding"),
     Description("Find the closes Navigation Mesh position to the target position")]
    public class FindClosestEdge : ActionTask
    {
        private NavMeshHit hit;

        [BlackboardOnly]
        public BBParameter<Vector3> saveFoundPosition;

        public BBParameter<Vector3> targetPosition;

        protected override void OnExecute()
        {
            if (NavMesh.FindClosestEdge(targetPosition.value, out hit, -1)) {
                saveFoundPosition.value = hit.position;
                EndAction(true);
                return;
            }
            EndAction(false);
        }
    }
}
