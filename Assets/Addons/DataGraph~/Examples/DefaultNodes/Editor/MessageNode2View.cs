using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEditor;
using UnityEngine;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(MessageNode2))]
    public class MessageNode2View : BaseNodeView
    {
        public override void Enable()
        {
            var node = nodeTarget as MessageNode2;
            var icon = EditorGUIUtility.IconContent("UnityLogo").image;
            AddMessageView("Custom message !", icon, Color.green);
        }
    }
}
