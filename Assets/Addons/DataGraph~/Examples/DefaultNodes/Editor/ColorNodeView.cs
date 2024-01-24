using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(ColorNode))]
    public class ColorNodeView : BaseNodeView
    {
        public override void Enable()
        {
            AddControlField(nameof(ColorNode.color));
            style.width = 200;
        }
    }
}
