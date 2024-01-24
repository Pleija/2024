#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Draw Gizmos"), Category("Events/Object"), Description("Calls Gizmos")]
    public class DrawGizmosEvents : RouterEventNode<Transform>
    {
        private FlowOutput onDrawGizmos;
        private GameObject receiver;

        protected override void RegisterPorts()
        {
            onDrawGizmos = AddFlowOutput("On Draw Gizmos");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onDrawGizmos += OnDrawGizmos;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onDrawGizmos -= OnDrawGizmos;
        }

        private void OnDrawGizmos(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onDrawGizmos.Call(new Flow());
        }
    }
}
