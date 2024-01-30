namespace Extensions
{
//
//    public static class AsyncOperationHandleExtensions {
//
//        public struct AsyncOperationHandleAwaiter<T>: INotifyCompletion {
//
//            private AsyncOperationHandle<T> _handle;
//
//            public AsyncOperationHandleAwaiter(AsyncOperationHandle<T> handle)
//            {
//                _handle = handle;
//            }
//
//            public bool IsCompleted {
//                get {
//                    return _handle.IsDone;
//                }
//            }
//
//            public T GetResult()
//            {
//                if (_handle.Status == AsyncOperationStatus.Succeeded) {
//                    return _handle.Result;
//                }
//
//                throw _handle.OperationException;
//            }
//
//            public void OnCompleted(Action continuation)
//            {
//                _handle.Completed += _ => continuation();
//            }
//
//        }
//
//        public struct AsyncOperationHandleAwaiter: INotifyCompletion {
//
//            private AsyncOperationHandle _handle;
//
//            public AsyncOperationHandleAwaiter(AsyncOperationHandle handle)
//            {
//                _handle = handle;
//            }
//
//            public bool IsCompleted {
//                get {
//                    return _handle.IsDone;
//                }
//            }
//
//            public object GetResult()
//            {
//                if (_handle.Status == AsyncOperationStatus.Succeeded) {
//                    return _handle.Result;
//                }
//
//                throw _handle.OperationException;
//            }
//
//            public void OnCompleted(Action continuation)
//            {
//                _handle.Completed += _ => continuation();
//            }
//
//        }
//
//        /// <summary>
//        /// Used to support the await keyword for AsyncOperationHandle.
//        /// </summary>
////        public static AsyncOperationHandleAwaiter<T> GetAwaiter<T>(this AsyncOperationHandle<T> handle)
////        {
////            return new AsyncOperationHandleAwaiter<T>(handle);
////        }
////
////        /// <summary>
////        /// Used to support the await keyword for AsyncOperationHandle.
////        /// </summary>
////        public static AsyncOperationHandleAwaiter GetAwaiter(this AsyncOperationHandle handle)
////        {
////            return new AsyncOperationHandleAwaiter(handle);
////        }
//
//        public static async Task<T> AsTask<T>(this AsyncOperationHandle<T> handle)
//        {
//            return await handle;
//        }
//
//        public static async Task AsTask(this AsyncOperationHandle handle)
//        {
//            await handle;
//        }
//
//    }
//
//    public static partial class Awaiters {
//
//        public class UnityWebRequestAwaiter: INotifyCompletion {
//
//            UnityWebRequestAsyncOperation asyncOp;
//            Action continuation;
//
//            public UnityWebRequestAwaiter(UnityWebRequestAsyncOperation asyncOp)
//            {
//                this.asyncOp = asyncOp;
//                asyncOp.completed += OnRequestCompleted;
//            }
//
//            public bool IsCompleted => asyncOp.isDone;
//            public void GetResult() { }
//
//            public void OnCompleted(Action continuation)
//            {
//                this.continuation = continuation;
//            }
//
//            void OnRequestCompleted(AsyncOperation obj)
//            {
//                continuation();
//            }
//
//        }
//
//        public static UnityWebRequestAwaiter GetAwaiter(this UnityWebRequestAsyncOperation asyncOp) =>
//            new UnityWebRequestAwaiter(asyncOp);
//
//        /**
//     *https://gist.github.com/mattyellen/d63f1f557d08f7254345bff77bfdc8b3
//     * Allows the use of async/await (instead of yield) with any Unity AsyncOperation
//     * Example:
//var getRequest = UnityWebRequest.Get("http://www.google.com");
//await getRequest.SendWebRequest();
//var result = getRequest.downloadHandler.text;
//     */
//        public static TaskAwaiter GetAwaiter(this AsyncOperation asyncOp)
//        {
//            var tcs = new TaskCompletionSource<object>();
//
//            asyncOp.completed += obj => {
//                tcs.SetResult(null);
//            };
//
//            return ((Task) tcs.Task).GetAwaiter();
//        }
//
//    }
}
