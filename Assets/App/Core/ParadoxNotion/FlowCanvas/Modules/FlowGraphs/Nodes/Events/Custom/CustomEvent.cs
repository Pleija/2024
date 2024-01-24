#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Custom Event", 100),
     Description(
         "Called when a custom event is received on target(s).\n- Receiver, is the object which received the event.\n- Sender, is the object which invoked the event.\n\n- To send an event from a graph use the SendEvent node.\n- To send an event from code use: 'FlowScriptController.SendEvent(string)'"),
     Category("Events/Custom"), ExecutionPriority(100)]
    public class CustomEvent : RouterEventNode<GraphOwner>
    {
        [RequiredField, DelayedField]
        public BBParameter<string> eventName = "EventName";

        private FlowOutput onReceived;
        private GraphOwner receiver;
        private GraphOwner sender;

        public override string name =>
                base.name + string.Format(" [ <color=#DDDDDD>{0}</color> ]", eventName);

        protected override void Subscribe(EventRouter router)
        {
            router.onCustomEvent += OnCustomEvent;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCustomEvent -= OnCustomEvent;
        }

        protected override void RegisterPorts()
        {
            onReceived = AddFlowOutput("Received");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Sender", () => {
                return sender;
            });
        }

        private void OnCustomEvent(string eventName, IEventData msg)
        {
            if (eventName.Equals(this.eventName.value, StringComparison.OrdinalIgnoreCase)) {
                var senderGraph = Graph.GetElementGraph(msg.sender);
                sender = senderGraph != null ? senderGraph.agent as GraphOwner : null;
                receiver = ResolveReceiver(msg.receiver);
                Logger.Log(
                    string.Format("Event Received from ({0}): '{1}'", receiver.name, eventName),
                    LogTag.EVENT, this);
                onReceived.Call(new Flow());
            }
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Name("Custom Event", 100),
     Description(
         "Called when a custom event is received on target(s).\n- Receiver, is the object which received the event.\n- Sender, is the object which invoked the event.\n\n- To send an event from a graph use the SendEvent(T) node.\n- To send an event from code use: 'FlowScriptController.SendEvent(string, T)'"),
     Category("Events/Custom"), ContextDefinedOutputs(typeof(Wild))]
    public class CustomEvent<T> : RouterEventNode<GraphOwner>
    {
        [RequiredField, DelayedField]
        public BBParameter<string> eventName = "EventName";

        private FlowOutput onReceived;
        private T receivedValue;
        private GraphOwner receiver;
        private GraphOwner sender;

        public override string name =>
                base.name + string.Format(" [ <color=#DDDDDD>{0}</color> ]", eventName);

        protected override void Subscribe(EventRouter router)
        {
            router.onCustomEvent += OnCustomEvent;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onCustomEvent -= OnCustomEvent;
        }

        protected override void RegisterPorts()
        {
            onReceived = AddFlowOutput("Received");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Sender", () => {
                return sender;
            });
            AddValueOutput("Event Value", () => {
                return receivedValue;
            });
        }

        private void OnCustomEvent(string eventName, IEventData msg)
        {
            if (eventName.Equals(this.eventName.value, StringComparison.OrdinalIgnoreCase)) {
                var senderGraph = Graph.GetElementGraph(msg.sender);
                sender = senderGraph != null ? senderGraph.agent as GraphOwner : null;
                receiver = ResolveReceiver(msg.receiver);
                if (msg is EventData<T>)
                    receivedValue = ((EventData<T>)msg).value;
                else if (msg.valueBoxed is T) receivedValue = (T)msg.valueBoxed;
                Logger.Log(
                    string.Format("Event Received from ({0}): '{1}'", receiver.name, eventName),
                    LogTag.EVENT, this);
                onReceived.Call(new Flow());
            }
        }
    }
}
