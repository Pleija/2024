﻿using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEngine.UIElements;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(SwitchNode))]
    public class SwitchNodeView : BaseNodeView
    {
        public override void Enable()
        {
            var node = nodeTarget as SwitchNode;

            // Create your fields using node's variables and add them to the controlsContainer
            controlsContainer.Add(new Label("Hello World !"));
        }
    }
}
