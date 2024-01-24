#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Animator"), Category("Events/Object"),
     Description(
         "Calls Animator based events. Note that using this node will override root motion as usual, but you can call 'Apply Builtin Root Motion' to get it back.")]
    public class AnimatorEvents : RouterEventNode<Animator>
    {
        private int layerIndex;
        private FlowOutput onAnimatorIK;
        private FlowOutput onAnimatorMove;
        private Animator receiver;

        protected override void RegisterPorts()
        {
            onAnimatorMove = AddFlowOutput("On Animator Move");
            onAnimatorIK = AddFlowOutput("On Animator IK");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Layer Index", () => {
                return layerIndex;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onAnimatorMove += OnAnimatorMove;
            router.onAnimatorIK += OnAnimatorIK;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onAnimatorMove -= OnAnimatorMove;
            router.onAnimatorIK -= OnAnimatorIK;
        }

        private void OnAnimatorMove(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            onAnimatorMove.Call(new Flow());
        }

        private void OnAnimatorIK(EventData<int> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            layerIndex = msg.value;
            onAnimatorIK.Call(new Flow());
        }
    }
}
