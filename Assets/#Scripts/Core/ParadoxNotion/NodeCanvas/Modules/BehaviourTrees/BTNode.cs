﻿using ParadoxNotion;
using NodeCanvas.Framework;

namespace NodeCanvas.BehaviourTrees
{
    ///<summary> Super Base class for BehaviourTree nodes that can live within a BehaviourTree Graph.</summary>
    public abstract class BTNode : Node
    {
        public sealed override System.Type outConnectionType => typeof(BTConnection);
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
        protected override UnityEditor.GenericMenu OnContextMenu(UnityEditor.GenericMenu menu)
        {
            menu.AddItem(new UnityEngine.GUIContent("Breakpoint"), isBreakpoint, () => {
                isBreakpoint = !isBreakpoint;
            });
            return ParadoxNotion.Design.EditorUtils.GetTypeSelectionMenu(typeof(BTDecorator),
                (t) => {
                    this.DecorateWith(t);
                }, menu, "Decorate");
        }

#endif
    }
}
