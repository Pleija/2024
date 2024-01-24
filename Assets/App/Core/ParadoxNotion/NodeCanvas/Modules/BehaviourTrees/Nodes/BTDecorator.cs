#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    ///<summary> Base class for BehaviourTree Decorator nodes.</summary>
    public abstract class BTDecorator : BTNode
    {
        public sealed override int maxOutConnections => 1;
        public sealed override Alignment2x2 commentsAlignment => Alignment2x2.Right;

        ///<summary>The decorated connection element</summary>
        protected Connection decoratedConnection =>
                outConnections.Count > 0 ? outConnections[0] : null;

        ///<summary>The decorated node element</summary>
        protected Node decoratedNode {
            get {
                var c = decoratedConnection;
                return c != null ? c.targetNode : null;
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override GenericMenu OnContextMenu(GenericMenu menu)
        {
            menu = base.OnContextMenu(menu);
            menu = EditorUtils.GetTypeSelectionMenu(typeof(BTDecorator), t => {
                this.ReplaceWith(t);
            }, menu, "Replace");
            return menu;
        }

#endif
    }
}
