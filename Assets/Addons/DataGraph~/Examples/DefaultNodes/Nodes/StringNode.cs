using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("String")]
    public class StringNode : BaseNode
    {
        [Output(name = "Out"), SerializeField]
        public string output;

        public override string name => "String";
    }
}
