#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    //We can't use proper versioning here since for that we would need to utilize GetComponent,
    //which is not possible to do in Deserialization. As such we make a completely new version.

    [Name("Collision2D"), Category("Events/Object"),
     Description(
         "Called when 2D Collision based events happen on target and expose collision information")]
    public class Collision2DEvents_Rigidbody : RouterEventNode<Rigidbody2D>
    {
        private Collision2D collision;
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
        private Rigidbody2D receiver;

        protected override void RegisterPorts()
        {
            onEnter = AddFlowOutput("Enter");
            onStay = AddFlowOutput("Stay");
            onExit = AddFlowOutput("Exit");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Other", () => {
                return collision.gameObject;
            });
            AddValueOutput("Contact Point", () => {
                return collision.contacts[0];
            });
            AddValueOutput("Collision Info", () => {
                return collision;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onCollisionEnter2D += OnCollisionEnter2D;
            router.onCollisionStay2D += OnCollisionStay2D;
            router.onCollisionExit2D += OnCollisionExit2D;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCollisionEnter2D -= OnCollisionEnter2D;
            router.onCollisionStay2D -= OnCollisionStay2D;
            router.onCollisionExit2D -= OnCollisionExit2D;
        }

        private void OnCollisionEnter2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onEnter.Call(new Flow());
        }

        private void OnCollisionStay2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onStay.Call(new Flow());
        }

        private void OnCollisionExit2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onExit.Call(new Flow());
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Name("Collision2D"), Category("Events/Object"),
     Description(
         "Called when 2D Collision based events happen on target and expose collision information"),
     DoNotList]
    public class Collision2DEvents : RouterEventNode<Collider2D>
    {
        private Collision2D collision;
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
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
                return collision.gameObject;
            });
            AddValueOutput("Contact Point", () => {
                return collision.contacts[0];
            });
            AddValueOutput("Collision Info", () => {
                return collision;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onCollisionEnter2D += OnCollisionEnter2D;
            router.onCollisionStay2D += OnCollisionStay2D;
            router.onCollisionExit2D += OnCollisionExit2D;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCollisionEnter2D -= OnCollisionEnter2D;
            router.onCollisionStay2D -= OnCollisionStay2D;
            router.onCollisionExit2D -= OnCollisionExit2D;
        }

        private void OnCollisionEnter2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onEnter.Call(new Flow());
        }

        private void OnCollisionStay2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onStay.Call(new Flow());
        }

        private void OnCollisionExit2D(EventData<Collision2D> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onExit.Call(new Flow());
        }
    }
}
