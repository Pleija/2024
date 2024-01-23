﻿using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;
using ParadoxNotion.Design;

namespace FlowCanvas.Nodes
{
    [Name("UI Pointer"), Category("Events/Object/UI"),
     Description(
         "Calls UI Pointer based events on target. The Unity Event system has to be set through 'GameObject/UI/Event System'")]
    public class UIPointerEvents : RouterEventNode<Transform>
    {
        private FlowOutput onPointerDown;
        private FlowOutput onPointerPressed;
        private FlowOutput onPointerUp;
        private FlowOutput onPointerEnter;
        private FlowOutput onPointerExit;
        private FlowOutput onPointerClick;
        private FlowOutput onPointerDrag;
        private FlowOutput onPointerDrop;
        private FlowOutput onPointerScroll;
        private GameObject receiver;
        private PointerEventData eventData;
        private bool updatePressed = false;

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
            AddValueOutput<GameObject>("Receiver", () => {
                return receiver;
            });
            AddValueOutput<PointerEventData>("Event Data", () => {
                return eventData;
            });
        }

        protected override void Subscribe(ParadoxNotion.Services.EventRouter router)
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

        protected override void UnSubscribe(ParadoxNotion.Services.EventRouter router)
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

        private void OnPointerDown(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDown.Call(new Flow());
            updatePressed = true;
            StartCoroutine(UpdatePressed());
        }

        private void OnPointerUp(ParadoxNotion.EventData<PointerEventData> msg)
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

        private void OnPointerEnter(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerEnter.Call(new Flow());
        }

        private void OnPointerExit(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerExit.Call(new Flow());
        }

        private void OnPointerClick(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerClick.Call(new Flow());
        }

        private void OnPointerDrag(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDrag.Call(new Flow());
        }

        private void OnPointerDrop(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerDrop.Call(new Flow());
        }

        private void OnPointerScroll(ParadoxNotion.EventData<PointerEventData> msg)
        {
            receiver = ResolveReceiver(msg.receiver).gameObject;
            eventData = msg.value;
            onPointerScroll.Call(new Flow());
        }
    }
}
