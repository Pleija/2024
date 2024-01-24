#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("GameObject")]
    public class IsActive : ConditionTask<Transform>
    {
        protected override string info => agentInfo + " is Active";
        protected override bool OnCheck() => agent.gameObject.activeInHierarchy;
    }
}
