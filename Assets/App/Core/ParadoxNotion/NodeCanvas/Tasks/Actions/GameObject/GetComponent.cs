#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject")]
    public class GetComponent<T> : ActionTask<Transform> where T : Component
    {
        [BlackboardOnly]
        public BBParameter<T> saveAs;

        protected override string info => string.Format("Get {0} as {1}", typeof(T).Name, saveAs);

        protected override void OnExecute()
        {
            var o = agent.GetComponent<T>();
            saveAs.value = o;
            EndAction(o != null);
        }
    }
}
