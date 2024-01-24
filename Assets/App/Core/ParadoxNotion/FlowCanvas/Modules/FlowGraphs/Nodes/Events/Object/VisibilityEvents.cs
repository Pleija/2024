#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Visibility"), Category("Events/Object"),
     Description("Calls events based on object's render visibility")]
    public class VisibilityEvents : RouterEventNode<Transform>
    {
        private FlowOutput onInvisible;
        private FlowOutput onVisible;
        private GameObject receiver;

        protected override void RegisterPorts()
        {
            onVisible = AddFlowOutput("Became Visible");
            onInvisible = AddFlowOutput("Became Invisible");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onBecameVisible += OnBecameVisible;
            router.onBecameInvisible += OnBecameInvisible;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onBecameVisible -= OnBecameVisible;
            router.onBecameInvisible -= OnBecameInvisible;
        }

        private void OnBecameVisible(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onVisible.Call(new Flow());
        }

        private void OnBecameInvisible(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onInvisible.Call(new Flow());
        }
    }
}
