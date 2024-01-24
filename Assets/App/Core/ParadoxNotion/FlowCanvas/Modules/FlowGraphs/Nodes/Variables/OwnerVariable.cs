#region
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Self", 100), Category("Variables"), Description("Returns the Owner GameObject"),
     ContextDefinedOutputs(typeof(GameObject))]
    public class OwnerVariable : FlowNode
    {
        public override string name => "<size=20>SELF</size>";

        protected override void RegisterPorts()
        {
            AddValueOutput("Value", () => {
                return graphAgent ? graphAgent.gameObject : null;
            });
        }
    }
}
