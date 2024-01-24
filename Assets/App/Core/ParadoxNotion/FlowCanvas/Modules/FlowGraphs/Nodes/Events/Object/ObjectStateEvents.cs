#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Object State"), Category("Events/Object"),
     Description("OnEnable, OnDisable and OnDestroy callback events for target object")]
    public class ObjectStateEvents : RouterEventNode<Transform>
    {
        private FlowOutput onDestroy;
        private FlowOutput onDisable;
        private FlowOutput onEnable;
        private GameObject receiver;

        protected override void RegisterPorts()
        {
            onEnable = AddFlowOutput("On Enable");
            onDisable = AddFlowOutput("On Disable");
            onDestroy = AddFlowOutput("On Destroy");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onEnable += OnEnable;
            router.onDisable += OnDisable;
            router.onDestroy += OnDestroy;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onEnable -= OnEnable;
            router.onDisable -= OnDisable;
            router.onDestroy -= OnDestroy;
        }

        private void OnEnable(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onEnable.Call(new Flow());
        }

        private void OnDisable(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onDisable.Call(new Flow());
        }

        private void OnDestroy(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            onDestroy.Call(new Flow());
        }
    }
}
