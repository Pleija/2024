#region
using System;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    [Obsolete, Category("Mutators (beta)"), Name("Root Switcher"),
     Description(
         "Switch the root node of the behaviour tree to a new one defined by tag\nBeta Feature!")]
    public class RootSwitcher : BTNode
    {
        private Node targetNode;
        public string targetNodeTag;

        public override void OnGraphStarted()
        {
            targetNode = graph.GetNodeWithTag<Node>(targetNodeTag);
        }

        protected override Status OnExecute(Component agent, IBlackboard blackboard)
        {
            if (string.IsNullOrEmpty(targetNodeTag)) return Status.Failure;
            if (targetNode == null) return Status.Failure;
            if (graph.primeNode != targetNode) graph.primeNode = targetNode;
            return Status.Success;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeGUI()
        {
            GUILayout.Label("Switch To '" + targetNodeTag + "'");
        }

        protected override void OnNodeInspectorGUI()
        {
            targetNodeTag = EditorUtils.Popup("Node Tag", targetNodeTag,
                graph.GetAllTagedNodes<Node>().Select(n => n.tag));
        }

#endif
    }
}
