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

    [Name("Collision"), Category("Events/Object"),
     Description(
         "Called when Collision based events happen on target and expose collision information")]
    public class CollisionEvents_Rigidbody : RouterEventNode<Rigidbody>
    {
        private Collision collision;
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
        private Rigidbody receiver;

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
            router.onCollisionEnter += OnCollisionEnter;
            router.onCollisionStay += OnCollisionStay;
            router.onCollisionExit += OnCollisionExit;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCollisionEnter -= OnCollisionEnter;
            router.onCollisionStay -= OnCollisionStay;
            router.onCollisionExit -= OnCollisionExit;
        }

        private void OnCollisionEnter(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onEnter.Call(new Flow());
        }

        private void OnCollisionStay(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onStay.Call(new Flow());
        }

        private void OnCollisionExit(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onExit.Call(new Flow());
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Name("Collision"), Category("Events/Object"),
     Description(
         "Called when Collision based events happen on target and expose collision information"),
     DoNotList]
    public class CollisionEvents : RouterEventNode<Collider>
    {
        private Collision collision;
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onStay;
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
            router.onCollisionEnter += OnCollisionEnter;
            router.onCollisionStay += OnCollisionStay;
            router.onCollisionExit += OnCollisionExit;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCollisionEnter -= OnCollisionEnter;
            router.onCollisionStay -= OnCollisionStay;
            router.onCollisionExit -= OnCollisionExit;
        }

        private void OnCollisionEnter(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onEnter.Call(new Flow());
        }

        private void OnCollisionStay(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onStay.Call(new Flow());
        }

        private void OnCollisionExit(EventData<Collision> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            collision = msg.value;
            onExit.Call(new Flow());
        }
    }
}
