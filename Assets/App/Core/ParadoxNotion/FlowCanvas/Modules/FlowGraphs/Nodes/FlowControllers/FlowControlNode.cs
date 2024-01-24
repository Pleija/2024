#region
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Flow Controllers"), Color("bf7fff"), ContextDefinedInputs(typeof(Flow)),
     ContextDefinedOutputs(typeof(Flow))]
    public abstract class FlowControlNode : FlowNode { }
}
