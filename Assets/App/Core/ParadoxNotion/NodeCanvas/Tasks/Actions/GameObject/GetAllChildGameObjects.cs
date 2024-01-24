#region
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject")]
    public class GetAllChildGameObjects : ActionTask<Transform>
    {
        public bool recursive = false;

        [BlackboardOnly]
        public BBParameter<List<GameObject>> saveAs;

        protected override string info => string.Format("{0} = {1} Children Of {2}", saveAs,
            recursive ? "All" : "First", agentInfo);

        protected override void OnExecute()
        {
            var found = new List<Transform>();

            foreach (Transform t in agent.transform) {
                found.Add(t);
                if (recursive) found.AddRange(Get(t));
            }
            saveAs.value = found.Select(t => t.gameObject).ToList();
            EndAction();
        }

        private List<Transform> Get(Transform parent)
        {
            var found = new List<Transform>();

            foreach (Transform t in parent) {
                found.Add(t);
                found.AddRange(Get(t));
            }
            return found;
        }
    }
}
