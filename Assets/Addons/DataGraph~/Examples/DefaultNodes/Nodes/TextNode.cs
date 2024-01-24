using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("Primitives/Text")]
    public class TextNode : BaseNode
    {
        [Output(name = "Label"), SerializeField]
        public string output;

        public override string name => "Text";
    }
}
