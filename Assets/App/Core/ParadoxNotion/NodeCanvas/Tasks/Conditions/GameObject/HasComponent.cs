#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("GameObject")]
    public class HasComponent<T> : ConditionTask<Transform> where T : Component
    {
        protected override bool OnCheck() => agent.GetComponent<T>() != null;
    }
}
