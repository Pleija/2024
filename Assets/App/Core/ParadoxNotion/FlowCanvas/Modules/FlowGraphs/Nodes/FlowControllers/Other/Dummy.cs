#region
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Identity", 100), Description("Use for organization.")]
    public class Dummy : FlowControlNode
    {
        public override string name => null;

        protected override void RegisterPorts()
        {
            var fOut = AddFlowOutput(" ", "Out");
            AddFlowInput(" ", "In", f => {
                fOut.Call(f);
            });
        }
    }
}
