#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Trigger2D"), Category("Events/Object"),
     Description(
         "Called when 2D Trigger based event happen on target when it has either a Collider2D or a Rigidbody2D")]
    public class Trigger2DEvents_Transform : RouterEventNode<Transform>
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
            router.onTriggerEnter2D += OnTriggerEnter2D;
            router.onTriggerStay2D += OnTriggerStay2D;
            router.onTriggerExit2D += OnTriggerExit2D;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onTriggerEnter2D -= OnTriggerEnter2D;
            router.onTriggerStay2D -= OnTriggerStay2D;
            router.onTriggerExit2D -= OnTriggerExit2D;
        }

        private void OnTriggerEnter2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onEnter.Call(new Flow());
        }

        private void OnTriggerStay2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onStay.Call(new Flow());
        }

        private void OnTriggerExit2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onExit.Call(new Flow());
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Name("Trigger2D"), Category("Events/Object"),
     Description("Called when 2D Trigger based event happen on target"), DoNotList]
    public class Trigger2DEvents : RouterEventNode<Collider2D>
    {
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
        private GameObject other;
        private Collider2D receiver;

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
            router.onTriggerEnter2D += OnTriggerEnter2D;
            router.onTriggerStay2D += OnTriggerStay2D;
            router.onTriggerExit2D += OnTriggerExit2D;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onTriggerEnter2D -= OnTriggerEnter2D;
            router.onTriggerStay2D -= OnTriggerStay2D;
            router.onTriggerExit2D -= OnTriggerExit2D;
        }

        private void OnTriggerEnter2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onEnter.Call(new Flow());
        }

        private void OnTriggerStay2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onStay.Call(new Flow());
        }

        private void OnTriggerExit2D(EventData<Collider2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            other = msg.value.gameObject;
            onExit.Call(new Flow());
        }
    }
}
