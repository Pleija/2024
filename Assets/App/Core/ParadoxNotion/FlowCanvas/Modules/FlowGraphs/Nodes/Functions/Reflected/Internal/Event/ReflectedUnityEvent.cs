#region
using System;
using System.Linq;
using System.Reflection;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine.Events;
#endregion

namespace FlowCanvas.Nodes
{
    [SpoofAOT]
    public class ReflectedUnityEvent
    {
        public delegate void UnityEventCallback(params object[] args);
        private MethodInfo _addListenerMethod;
        private MethodInfo _callMethod;
        private MethodInfo _removeListenerMethod;
        public ReflectedUnityEvent() { }

        ///<summary>Create a reflected unity event for target unity event type</summary>
        public ReflectedUnityEvent(Type eventType)
        {
            InitForEventType(eventType);
        }

        public ParameterInfo[] parameters { get; private set; }
        public Type eventType { get; private set; }
        private event UnityEventCallback _callback;

        ///<summary>Initialize for target unity event type</summary>
        public void InitForEventType(Type eventType)
        {
            this.eventType = eventType;
            if (this.eventType == null || !this.eventType.RTIsSubclassOf(typeof(UnityEventBase)))
                return;
            var invokeMethod = this.eventType.GetMethod(
                "Invoke", BindingFlags.Public | BindingFlags.Instance);
            parameters = invokeMethod.GetParameters();
            var thisType = GetType();
            if (parameters.Length == 0) _callMethod = thisType.RTGetMethod("CallbackMethod0");
            if (parameters.Length == 1) _callMethod = thisType.RTGetMethod("CallbackMethod1");
            if (parameters.Length == 2) _callMethod = thisType.RTGetMethod("CallbackMethod2");
            if (parameters.Length == 3) _callMethod = thisType.RTGetMethod("CallbackMethod3");
            if (parameters.Length == 4) _callMethod = thisType.RTGetMethod("CallbackMethod4");
            if (_callMethod.IsGenericMethodDefinition)
                _callMethod =
                        _callMethod.MakeGenericMethod(parameters.Select(p => p.ParameterType)
                                .ToArray());
            var typeArray = new[] { typeof(object), typeof(MethodInfo) };
            var flags = BindingFlags.Instance | BindingFlags.NonPublic;
            _addListenerMethod = typeof(UnityEventBase).GetMethod(
                "AddListener", flags, null, typeArray, null);
            _removeListenerMethod = typeof(UnityEventBase).GetMethod(
                "RemoveListener", flags, null, typeArray, null);
        }

        ///<summary>Subscribe to target unity event</summary>
        public void StartListening(UnityEventBase targetEvent, UnityEventCallback callback)
        {
            _callback += callback;
            _addListenerMethod.Invoke(targetEvent, new object[] { this, _callMethod });
        }

        ///<summary>Unsubscribe from target unity event</summary>
        public void StopListening(UnityEventBase targetEvent, UnityEventCallback callback)
        {
            _callback -= callback;
            _removeListenerMethod.Invoke(targetEvent, new object[] { this, _callMethod });
        }

        public void CallbackMethod0()
        {
            _callback();
        }

        public void CallbackMethod1<T0>(T0 arg0)
        {
            _callback(arg0);
        }

        public void CallbackMethod2<T0, T1>(T0 arg0, T1 arg1)
        {
            _callback(arg0, arg1);
        }

        public void CallbackMethod3<T0, T1, T2>(T0 arg0, T1 arg1, T2 arg2)
        {
            _callback(arg0, arg1, arg2);
        }

        public void CallbackMethod4<T0, T1, T2, T3>(T0 arg0, T1 arg1, T2 arg2, T3 arg3)
        {
            _callback(arg0, arg1, arg2, arg3);
        }
    }
}
