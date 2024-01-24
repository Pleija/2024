#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject"), Description("Find the closest game object of tag to the agent")]
    public class FindClosestWithTag : ActionTask<Transform>
    {
        public BBParameter<bool> ignoreChildren;

        [BlackboardOnly]
        public BBParameter<float> saveDistanceAs;

        [BlackboardOnly]
        public BBParameter<GameObject> saveObjectAs;

        [TagField, RequiredField]
        public BBParameter<string> searchTag;

        protected override void OnExecute()
        {
            var found = GameObject.FindGameObjectsWithTag(searchTag.value);

            if (found.Length == 0) {
                saveObjectAs.value = null;
                saveDistanceAs.value = 0;
                EndAction(false);
                return;
            }
            GameObject closest = null;
            var dist = Mathf.Infinity;

            foreach (var go in found) {
                if (go.transform == agent) continue;
                if (ignoreChildren.value && go.transform.IsChildOf(agent)) continue;
                var newDist = Vector3.Distance(go.transform.position, agent.position);

                if (newDist < dist) {
                    dist = newDist;
                    closest = go;
                }
            }
            saveObjectAs.value = closest;
            saveDistanceAs.value = dist;
            EndAction();
        }
    }
}
