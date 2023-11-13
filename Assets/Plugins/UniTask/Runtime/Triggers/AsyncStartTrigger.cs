#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
using BetterEvents;
using UnityEngine;
using UnityEngine.Events;

namespace Cysharp.Threading.Tasks.Triggers
{
    public static partial class AsyncTriggerExtensions
    {
        public static AsyncStartTrigger GetAsyncStartTrigger(this GameObject gameObject)
        {
            return GetOrAddComponent<AsyncStartTrigger>(gameObject);
        }

        public static AsyncStartTrigger GetAsyncStartTrigger(this Component component)
        {
            return component.gameObject.GetAsyncStartTrigger();
        }
    }

    [DisallowMultipleComponent]
    public sealed class AsyncStartTrigger : AsyncTriggerBase<AsyncUnit>
    {
        bool called;
        public UnityEvent OnStart;
        public BetterEvent OnStart2;

        void Start()
        {
            OnStart?.Invoke();
            OnStart2.Invoke();
            called = true;
            RaiseEvent(AsyncUnit.Default);
        }

        public UniTask StartAsync()
        {
            if(called) return UniTask.CompletedTask;
            return ((IAsyncOneShotTrigger)new AsyncTriggerHandler<AsyncUnit>(this, true))
                .OneShotAsync();
        }
    }
}
