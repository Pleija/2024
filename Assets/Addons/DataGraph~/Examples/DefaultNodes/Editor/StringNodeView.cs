using System.Linq;
using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEngine;
using UnityEngine.UIElements;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(StringNode))]
    public class StringNodeView : BaseNodeView
    {
        public override void Enable()
        {
            var node = nodeTarget as StringNode;
            var textArea = new TextField(-1, true, false, '*') { value = node.output };
            textArea.Children().First().style.unityTextAlign = TextAnchor.UpperLeft;
            textArea.style.width = 200;
            textArea.style.height = 100;
            textArea.RegisterValueChangedCallback(v => {
                owner.RegisterCompleteObjectUndo("Edit string node");
                node.output = v.newValue;
            });
            controlsContainer.Add(textArea);
        }
    }
}
