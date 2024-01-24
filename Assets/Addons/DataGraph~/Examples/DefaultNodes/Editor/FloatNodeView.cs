using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEditor.UIElements;
using UnityEngine.UIElements;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(FloatNode))]
    public class FloatNodeView : BaseNodeView
    {
        public override void Enable()
        {
            var floatNode = nodeTarget as FloatNode;
            var floatField = new DoubleField {
                value = floatNode.input,
            };
            floatNode.onProcessed += () => floatField.value = floatNode.input;
            floatField.RegisterValueChangedCallback((v) => {
                owner.RegisterCompleteObjectUndo("Updated floatNode input");
                floatNode.input = (float)v.newValue;
            });
            controlsContainer.Add(floatField);
        }
    }
}
