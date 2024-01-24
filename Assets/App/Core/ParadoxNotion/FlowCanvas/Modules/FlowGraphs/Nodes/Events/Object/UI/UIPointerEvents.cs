#region
using System.Collections;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
using UnityEngine.EventSystems;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("UI Pointer"), Category("Events/Object/UI"),
     Description(
         "Calls UI Pointer based events on target. The Unity Event system has to be set through 'GameObject/UI/Event System'")]
    public class UIPointerEvents : RouterEventNode<Transform>
    {
        private PointerEventData eventData;
        private FlowOutput onPointerClick;
        private FlowOutput onPointerDown;
        private FlowOutput onPointerDrag;
        private FlowOutput onPointerDrop;
        private FlowOutput onPointerEnter;
        private FlowOutput onPointerExit;
        private FlowOutput onPointerPressed;
        private FlowOutput onPointerScroll;
        private FlowOutput onPointerUp;
        private GameObject receiver;
        private bool updatePressed;

        protected override void RegisterPorts()
        {
            onPointerClick = AddFlowOutput("Click");
            onPointerDown = AddFlowOutput("Down");
            onPointerPressed = AddFlowOutput("Pressed");
            onPointerUp = AddFlowOutput("Up");
            onPointerEnter = AddFlowOutput("Enter");
            onPointerExit = AddFlowOutput("Exit");
            onPointerDrag = AddFlowOutput("Drag");
            onPointerDrop = AddFlowOutput("Drop");
            onPointerScroll = AddFlowOutput("Scroll");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Event Data", () => {
                return eventData;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onPointerEnter += OnPointerEnter;
            router.onPointerExit += OnPointerExit;
            router.onPointerDown += OnPointerDown;
            router.onPointerUp += OnPointerUp;
            router.onPointerClick += OnPointerClick;
            router.onDrag += OnPointerDrag;
            router.onDrop += OnPointerDrop;
            router.onScroll += OnPointerScroll;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onPointerEnter -= OnPointerEnter;
            router.onPointerExit -= OnPointerExit;
            router.onPointerDown -= OnPointerDown;
            router.onPointerUp -= OnPointerUp;
            router.onPointerClick -= OnPointerClick;
            router.onDrag -= OnPointerDrag;
            router.onDrop -= OnPointerDrop;
            router.onScroll -= OnPointerScroll;
        }

        private void OnPointerDown(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDown.Call(new Flow());
            updatePressed = true;
            StartCoroutine(UpdatePressed());
        }

        private void OnPointerUp(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerUp.Call(new Flow());
            updatePressed = false;
        }

        private IEnumerator UpdatePressed()
        {
            while (updatePressed) {
                onPointerPressed.Call(new Flow());
                yield return null;
            }
        }

        private void OnPointerEnter(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerEnter.Call(new Flow());
        }

        private void OnPointerExit(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerExit.Call(new Flow());
        }

        private void OnPointerClick(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerClick.Call(new Flow());
        }

        private void OnPointerDrag(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDrag.Call(new Flow());
        }

        private void OnPointerDrop(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDrop.Call(new Flow());
        }

        private void OnPointerScroll(EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerScroll.Call(new Flow());
        }
    }
}
