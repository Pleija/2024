using GraphProcessor;
using Nodes.Examples.ConditionalGraph;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [NodeMenuItem("Print")]
    public class PrintNode : BaseNode
    {
        [Input]
        public object obj;

        public override string name => "Print";
    }

    [NodeMenuItem("Conditional/Print")]
    public class ConditionalPrintNode : LinearConditionalNode
    {
        [Input]
        public object obj;

        public override string name => "Print";
    }
}
