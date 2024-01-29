using System;
using Puerts;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runtime.Extensions
{
    public static class Assets
    {
        public static ArrayBuffer toBuffer(this Array bytes) {
            if (bytes is byte[] value) return new ArrayBuffer(value);

            return null;
        }

        public static AsyncOperationHandle<T> isOK<T>(this AsyncOperationHandle<T> handle,
            Action<AsyncOperationHandle<T>> action = null, Action<AsyncOperationHandle<T>> onError = null) {
            handle.Completed += op => {
                if (handle.Status == AsyncOperationStatus.Succeeded) {
                    action?.Invoke(handle);
                    return;
                }

                if (onError != null)
                    onError?.Invoke(handle);
                else
                    throw new Exception($" FAIL: {handle.Status}");
            };

            return handle;
        }

        public static AsyncOperationHandle isOK(this AsyncOperationHandle handle,
            Action<AsyncOperationHandle> action = null, Action<AsyncOperationHandle> onError = null) {
            handle.Completed += op => {
                if (handle.Status == AsyncOperationStatus.Succeeded) {
                    action?.Invoke(handle);
                    return;
                }

                if (onError != null)
                    onError?.Invoke(handle);
                else
                    throw new Exception($" FAIL: {handle.Status}");
            };

            return handle;
        }

        //
//    public static UniTask<T>.Awaiter GetAwaiter<T>(this AsyncOperationHandle<T> operation)
//    {
//        var tcs = new UniTaskCompletionSource<T>();
//        Action<AsyncOperationHandle<T>> eventHandler = null;
//
//        eventHandler = res => {
//            // operation.Completed -= eventHandler; // we can't seem to do this!?
//            tcs.TrySetResult(res.Result);
//        };
//
//        operation.Completed += eventHandler;
//
//        return tcs.Task.GetAwaiter();
//    }
//
//    public static UniTask.Awaiter GetAwaiter(this AsyncOperationHandle operation) => operation.ToUniTask().GetAwaiter();
//
//    // bonus .. you can await UnitytEvents
//    public static UniTask.Awaiter GetAwaiter(this UnityEvent uevent)
//    {
//        var tcs = new UniTaskCompletionSource();
//        UnityAction eventHandler = null;
//
//        eventHandler = () => {
//            uevent.RemoveListener(eventHandler);
//            tcs.TrySetResult();
//        };
//
//        uevent.AddListener(eventHandler);
//
//        return tcs.Task.GetAwaiter();
//    }
//
//    // public static TaskAwaiter<T> GetAwaiter<T>(this AsyncOperationHandle<T> ap)
//    // {
//    //     var tcs = new TaskCompletionSource<T>();
//    //     ap.Completed += op => tcs.TrySetResult(op.Result);
//    //     return tcs.Task.GetAwaiter();
//    // }
//
//    // public static AsyncOperationAwaiter GetAwaiter(this AsyncOperationHandle operation)
//    // {
//    //     return new AsyncOperationAwaiter(operation);
//    // }
//    //
//    // public static AsyncOperationAwaiter<T> GetAwaiter<T>(this AsyncOperationHandle<T> operation) {
//    //     return new AsyncOperationAwaiter<T>(operation);
//    // }
//    //
//    // public struct AsyncOperationAwaiter : INotifyCompletion
//    // {
//    //     private readonly AsyncOperationHandle _operation;
//    //
//    //     public AsyncOperationAwaiter(AsyncOperationHandle operation)
//    //     {
//    //         _operation = operation;
//    //     }
//    //
//    //     public bool IsCompleted => _operation.Status != AsyncOperationStatus.None;
//    //
//    //     public void OnCompleted(Action continuation) => _operation.Completed += (op) => continuation?.Invoke();
//    //
//    //     public object GetResult() => _operation.Result;
//    // }
//    //
//    // public struct AsyncOperationAwaiter<T> : INotifyCompletion
//    // {
//    //     private readonly AsyncOperationHandle<T> _operation;
//    //
//    //     public AsyncOperationAwaiter(AsyncOperationHandle<T> operation)
//    //     {
//    //         _operation = operation;
//    //     }
//    //
//    //     public bool IsCompleted => _operation.Status != AsyncOperationStatus.None;
//    //
//    //     public void OnCompleted(Action continuation) => _operation.Completed += (op) => continuation?.Invoke();
//    //
//    //     public T GetResult() => _operation.Result;
//    // }
//
    }
}
