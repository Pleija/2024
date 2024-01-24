#region
using NodeCanvas.Framework;
#endregion

namespace FlowCanvas.Nodes
{
    public abstract class ParameterVariableNode : FlowNode
    {
        public abstract BBParameter parameter { get; }
    }
}
