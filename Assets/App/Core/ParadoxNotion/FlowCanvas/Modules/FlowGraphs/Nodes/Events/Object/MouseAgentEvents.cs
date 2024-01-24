#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Mouse"), Category("Events/Object"),
     Description("Called when mouse based operations happen on target collider")]
    public class MouseAgentEvents : RouterEventNode<Collider>
    {
        private RaycastHit hit;
        private FlowOutput onDown;
        private FlowOutput onDrag;
        private FlowOutput onEnter;
        private FlowOutput onExit;
        private FlowOutput onOver;
        private FlowOutput onUp;
        private Collider receiver;

        protected override void RegisterPorts()
        {
            onDown = AddFlowOutput("Down");
            onUp = AddFlowOutput("Up");
            onEnter = AddFlowOutput("Enter");
            onOver = AddFlowOutput("Over");
            onExit = AddFlowOutput("Exit");
            onDrag = AddFlowOutput("Drag");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Info", () => {
                return hit;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onMouseEnter += OnMouseEnter;
            router.onMouseOver += OnMouseOver;
            router.onMouseExit += OnMouseExit;
            router.onMouseDown += OnMouseDown;
            router.onMouseUp += OnMouseUp;
            router.onMouseDrag += OnMouseDrag;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onMouseEnter -= OnMouseEnter;
            router.onMouseOver -= OnMouseOver;
            router.onMouseExit -= OnMouseExit;
            router.onMouseDown -= OnMouseDown;
            router.onMouseUp -= OnMouseUp;
            router.onMouseDrag -= OnMouseDrag;
        }

        private void OnMouseEnter(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onEnter.Call(new Flow());
        }

        private void OnMouseOver(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onOver.Call(new Flow());
        }

        private void OnMouseExit(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onExit.Call(new Flow());
        }

        private void OnMouseDown(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onDown.Call(new Flow());
        }

        private void OnMouseUp(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onUp.Call(new Flow());
        }

        private void OnMouseDrag(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            StoreHit();
            onDrag.Call(new Flow());
        }

        private void StoreHit()
        {
            if (Camera.main != null)
                Physics.Raycast(Camera.main.ScreenPointToRay(Input.mousePosition), out hit,
                    Mathf.Infinity);
        }
    }
}
