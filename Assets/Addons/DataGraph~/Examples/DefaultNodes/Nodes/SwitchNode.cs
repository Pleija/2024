using GraphProcessor;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("Conditional/Switch")]
    public class SwitchNode : BaseNode
    {
        [Input(name = "In")]
        public float input;

        [Output(name = "Out")]
        public float output;

        public override string name => "Switch";

        protected override void Process()
        {
            output = input * 42;
        }
    }
}
