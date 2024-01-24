#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    ///<summary> Super Base class for BehaviourTree nodes that can live within a BehaviourTree Graph.</summary>
    public abstract class BTNode : Node
    {
        public sealed override Type outConnectionType => typeof(BTConnection);
        public sealed override bool allowAsPrime => true;
        public sealed override bool canSelfConnect => false;
        public override Alignment2x2 commentsAlignment => Alignment2x2.Bottom;
        public override Alignment2x2 iconAlignment => Alignment2x2.Default;
        public override int maxInConnections => 1;
        public override int maxOutConnections => 0;

        ///<summary>Add a child node to this node connected to the specified child index</summary>
        public T AddChild<T>(int childIndex) where T : BTNode
        {
            if (outConnections.Count >= maxOutConnections && maxOutConnections != -1) return null;
            var child = graph.AddNode<T>();
            graph.ConnectNodes(this, child, childIndex);
            return child;
        }

        ///<summary>Add a child node to this node connected last</summary>
        public T AddChild<T>() where T : BTNode
        {
            if (outConnections.Count >= maxOutConnections && maxOutConnections != -1) return null;
            var child = graph.AddNode<T>();
            graph.ConnectNodes(this, child);
            return child;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override GenericMenu OnContextMenu(GenericMenu menu)
        {
            menu.AddItem(new GUIContent("Breakpoint"), isBreakpoint, () => {
                isBreakpoint = !isBreakpoint;
            });
            return EditorUtils.GetTypeSelectionMenu(typeof(BTDecorator), t => {
                this.DecorateWith(t);
            }, menu, "Decorate");
        }

#endif
    }
}
