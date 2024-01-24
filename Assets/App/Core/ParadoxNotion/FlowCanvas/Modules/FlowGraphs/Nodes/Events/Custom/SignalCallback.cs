#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Events/Signals"),
     Description(
         "Check if a defined Signal has been invoked. Signals are similar to name-based events but are safer to changes and support multiple parameters."),
     HasRefreshButton, DropReferenceType(typeof(SignalDefinition)), ExecutionPriority(100)]
    public class SignalCallback : RouterEventNode<Transform>, IDropedReferenceNode
    {
        [GatherPortsCallback]
        public BBParameter<SignalDefinition> _signalDefinition;

        private object[] args;
        private FlowOutput onReceived;
        private Transform receiver;
        private Transform sender;

        private SignalDefinition signalDefinition {
            get => _signalDefinition.value;
            set => _signalDefinition.value = value;
        }

        public override string name => base.name
                + string.Format(" [ <color=#DDDDDD>{0}</color> ]",
                    signalDefinition != null ? signalDefinition.name : "NULL");

        public void SetTarget(Object target)
        {
            signalDefinition = (SignalDefinition)target;
            GatherPorts();
        }

        protected override void Subscribe(EventRouter router) { }
        protected override void UnSubscribe(EventRouter router) { }

        public override void OnPostGraphStarted()
        {
            base.OnPostGraphStarted();

            if (signalDefinition != null) {
                signalDefinition.onInvoke -= OnInvoked;
                signalDefinition.onInvoke += OnInvoked;
            }
        }

        public override void OnGraphStoped()
        {
            base.OnGraphStoped();
            if (signalDefinition != null) signalDefinition.onInvoke -= OnInvoked;
        }

        protected override void RegisterPorts()
        {
            onReceived = AddFlowOutput("Received");
            AddValueOutput("Receiver", () => receiver);
            AddValueOutput("Sender", () => sender);

            if (signalDefinition != null)
                for (var _i = 0; _i < signalDefinition.parameters.Count; _i++) {
                    var i = _i;
                    var parameter = signalDefinition.parameters[i];
                    AddValueOutput(parameter.name, parameter.ID, parameter.type, () => args[i]);
                }
        }

        private void OnInvoked(Transform sender, Transform receiver, bool isGlobal, object[] args)
        {
            this.receiver = ResolveReceiver(receiver != null ? receiver.gameObject : null);

            if (this.receiver != null || isGlobal) {
                this.sender = sender;
                this.args = args;
                onReceived.Call(new Flow());
            }
        }
    }
}
