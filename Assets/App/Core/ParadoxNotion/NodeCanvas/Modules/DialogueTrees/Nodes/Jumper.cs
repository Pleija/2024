#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization.FullSerializer;
using UnityEngine;
#endregion

namespace NodeCanvas.DialogueTrees
{
    [Name("JUMP"),
     Description(
         "Select a target node to jump to.\nFor your convenience in identifying nodes in the dropdown, please give a Tag name to the nodes you want to use in this way."),
     Category("Control"), Icon("Set"), Color("6ebbff")]
    public class Jumper : DTNode, IHaveNodeReference
    {
        [fsSerializeAs("_sourceNodeUID")]
        public NodeReference<DTNode> _targetNode;

        private DTNode target => _targetNode?.Get(graph);
        public override int maxOutConnections => 0;
        public override bool requireActorSelection => false;
        INodeReference IHaveNodeReference.targetReference => _targetNode;

        protected override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (target == null) return Error("Target Node of Jumper node is null");
            DLGTree.EnterNode(target);
            return Status.Success;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeGUI()
        {
            GUILayout.Label(
                string.Format("<b>{0}</b>", target != null ? target.ToString() : "NONE"));
        }
#endif
    }
}
