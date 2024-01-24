#region
using System.Collections.Generic;
using System.Linq;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Events/Object"), Description("Events relevant to transform changes")]
    public class TransformEvents : RouterEventNode<Transform>
    {
        private IEnumerable<Transform> children;
        private FlowOutput onChildrenChanged;
        private FlowOutput onParentChanged;
        private Transform parent;
        private Transform receiver;

        protected override void RegisterPorts()
        {
            onParentChanged = AddFlowOutput("On Transform Parent Changed");
            onChildrenChanged = AddFlowOutput("On Transform Children Changed");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Parent", () => {
                return parent;
            });
            AddValueOutput("Children", () => {
                return children;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onTransformParentChanged += OnTransformParentChanged;
            router.onTransformChildrenChanged += OnTransformChildrenChanged;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onTransformParentChanged -= OnTransformParentChanged;
            router.onTransformChildrenChanged -= OnTransformChildrenChanged;
        }

        private void OnTransformParentChanged(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            parent = receiver.parent;
            children = receiver.Cast<Transform>();
            onParentChanged.Call(new Flow());
        }

        private void OnTransformChildrenChanged(EventData msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            parent = receiver.parent;
            children = receiver.Cast<Transform>();
            onChildrenChanged.Call(new Flow());
        }
    }
}
