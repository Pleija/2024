#region
using System;
using NodeCanvas.Framework;
using UnityEngine;
#endregion

namespace NodeCanvas.DialogueTrees
{
    [Obsolete("Use Jumpers instead")]
    public class GoToNode : DTNode
    {
        [SerializeField]
        private DTNode _targetNode = null;

        public override int maxOutConnections => 0;
        public override bool requireActorSelection => false;

        protected override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (_targetNode == null) return Error("Target node of GOTO node is null");
            DLGTree.EnterNode(_targetNode);
            return Status.Success;
        }
    }
}
