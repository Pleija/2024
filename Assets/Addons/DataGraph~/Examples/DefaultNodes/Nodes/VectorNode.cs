using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("Custom/Vector")]
    public class VectorNode : BaseNode
    {
        [Output(name = "Out")]
        public Vector4 output;

        [Input(name = "In"), SerializeField]
        public Vector4 input;

        public override string name => "Vector";

        protected override void Process()
        {
            output = input;
        }
    }
}
