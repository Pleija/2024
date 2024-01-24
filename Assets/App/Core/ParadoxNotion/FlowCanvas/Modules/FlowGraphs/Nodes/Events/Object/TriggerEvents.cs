#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Trigger"), Category("Events/Object"),
     Description(
         "Called when Trigger based event happen on target when it has either a Collider or a Rigidbody")]
    public class TriggerEvents_Transform : RouterEventNode<Transform>
    {
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
        private GameObject other;
        private Transform receiver;

        protected override void RegisterPorts()
        {
            onEnter = AddFlowOutput("Enter");
            onStay = AddFlowOutput("Stay");
            onExit = AddFlowOutput("Exit");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Other", () => {
                return other;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onTriggerEnter += OnTriggerEnter;
            router.onTriggerStay += OnTriggerStay;
            router.onTriggerExit += OnTriggerExit;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onTriggerEnter -= OnTriggerEnter;
            router.onTriggerStay -= OnTriggerStay;
            router.onTriggerExit -= OnTriggerExit;
        }

        private void OnTriggerEnter(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onEnter.Call(new Flow());
        }

        private void OnTriggerStay(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onStay.Call(new Flow());
        }

        private void OnTriggerExit(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onExit.Call(new Flow());
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Name("Trigger"), Category("Events/Object"),
     Description("Called when Trigger based event happen on target"), DoNotList]
    public class TriggerEvents : RouterEventNode<Collider>
    {
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
        private GameObject other;
        private Collider receiver;

        protected override void RegisterPorts()
        {
            onEnter = AddFlowOutput("Enter");
            onStay = AddFlowOutput("Stay");
            onExit = AddFlowOutput("Exit");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Other", () => {
                return other;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onTriggerEnter += OnTriggerEnter;
            router.onTriggerStay += OnTriggerStay;
            router.onTriggerExit += OnTriggerExit;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onTriggerEnter -= OnTriggerEnter;
            router.onTriggerStay -= OnTriggerStay;
            router.onTriggerExit -= OnTriggerExit;
        }

        private void OnTriggerEnter(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onEnter.Call(new Flow());
        }

        private void OnTriggerStay(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onStay.Call(new Flow());
        }

        private void OnTriggerExit(EventData<Collider> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onExit.Call(new Flow());
        }
    }
}
