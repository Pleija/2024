#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member

using System.Threading;
using BetterEvents;
using UnityEngine;
using UnityEngine.Events;

namespace Cysharp.Threading.Tasks.Triggers
{
    public static partial class AsyncTriggerExtensions
    {
        public static AsyncAwakeTrigger GetAsyncAwakeTrigger(this GameObject gameObject)
        {
            return GetOrAddComponent<AsyncAwakeTrigger>(gameObject);
        }

        public static AsyncAwakeTrigger GetAsyncAwakeTrigger(this Component component)
        {
            return component.gameObject.GetAsyncAwakeTrigger();
        }
    }

    [DisallowMultipleComponent]
    public sealed class AsyncAwakeTrigger : AsyncTriggerBase<AsyncUnit>
    {
        public UnityEvent OnAwake;
        public BetterEvent OnAwake2;
        public UniTask AwakeAsync()
        {
            OnAwake?.Invoke();
            OnAwake2.Invoke();
            if (calledAwake) return UniTask.CompletedTask;

            return ((IAsyncOneShotTrigger)new AsyncTriggerHandler<AsyncUnit>(this, true)).OneShotAsync();
        }
    }
}

