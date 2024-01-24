#region
using System;
using System.Reflection;
using ParadoxNotion;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Obsolete]
    public abstract class StaticCodeEventBase : EventNode
    {
        [SerializeField]
        protected string eventName;

        [SerializeField]
        protected Type targetType;

        protected EventInfo eventInfo =>
                targetType != null ? targetType.RTGetEvent(eventName) : null;

        public void SetEvent(EventInfo e)
        {
            targetType = e.RTReflectedOrDeclaredType();
            eventName = e.Name;
            GatherPorts();
        }

        public override void OnGraphStarted()
        {
            base.OnGraphStarted();

            if (string.IsNullOrEmpty(eventName)) {
                Debug.LogError("No Event Selected for 'Static Code Event'");
                return;
            }
            if (eventInfo == null)
                Debug.LogError(string.Format("Event {0} is not found", eventName));
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Obsolete]
    public class StaticCodeEvent : StaticCodeEventBase
    {
        private FlowOutput o;
        private Action pointer;

        public override void OnGraphStarted()
        {
            base.OnGraphStarted();
            pointer = Call;
            eventInfo.AddEventHandler(null, pointer);
        }

        public override void OnGraphStoped()
        {
            if (!string.IsNullOrEmpty(eventName) && eventInfo != null)
                eventInfo.RemoveEventHandler(null, pointer);
        }

        private void Call()
        {
            o.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            if (!string.IsNullOrEmpty(eventName)) o = AddFlowOutput(eventName);
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Obsolete]
    public class StaticCodeEvent<T> : StaticCodeEventBase
    {
        private T eventValue;
        private FlowOutput o;
        private Action<T> pointer;

        public override void OnGraphStarted()
        {
            base.OnGraphStarted();
            pointer = Call;
            eventInfo.AddEventHandler(null, pointer);
        }

        public override void OnGraphStoped()
        {
            if (!string.IsNullOrEmpty(eventName) && eventInfo != null)
                eventInfo.RemoveEventHandler(null, pointer);
        }

        private void Call(T value)
        {
            eventValue = value;
            o.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            if (!string.IsNullOrEmpty(eventName)) {
                o = AddFlowOutput(eventName);
                AddValueOutput("Value", () => {
                    return eventValue;
                });
            }
        }
    }
}
