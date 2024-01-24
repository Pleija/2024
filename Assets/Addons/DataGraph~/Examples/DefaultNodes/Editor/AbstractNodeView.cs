using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEngine.UIElements;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(AbstractNode))]
    public class AbstractNodeView : BaseNodeView
    {
        public override void Enable()
        {
            controlsContainer.Add(new Label("Inheritance support"));
        }
    }
}
