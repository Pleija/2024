using System.Collections.Generic;
using System.Linq;
using GraphProcessor;
using Nodes.Examples.ConditionalGraph;
using UnityEngine.Rendering;

namespace Nodes.Examples.DefaultNodes.Nodes
{
    [System.Serializable, NodeMenuItem("Conditional/If"), NodeMenuItem("Conditional/Branch")]
    public class IfNode : ConditionalNode
    {
        [Input(name = "Condition")]
        public bool condition;

        [Output(name = "True")]
        public ConditionalLink @true;

        [Output(name = "False")]
        public ConditionalLink @false;

        [Setting("Compare Function")]
        public CompareFunction compareOperator;

        public override string name => "If";

        public override IEnumerable<ConditionalNode> GetExecutedNodes()
        {
            var fieldName = condition ? nameof(@true) : nameof(@false);

            // Return all the nodes connected to either the true or false node
            return outputPorts.FirstOrDefault(n => n.fieldName == fieldName).GetEdges()
                .Select(e => e.inputNode as ConditionalNode);
        }
    }
}
