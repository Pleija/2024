using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("Primitives/Color")]
    public class ColorNode : BaseNode
    {
        [Output(name = "Color"), SerializeField]
        public new Color color;

        public override string name => "Color";
    }
}
