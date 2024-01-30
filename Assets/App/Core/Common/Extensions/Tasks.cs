using System.Collections;
using System.Runtime.ExceptionServices;
using System.Threading.Tasks;

namespace Extensions
{
    public static class Tasks
    {
        //https://answers.unity.com/questions/1597151/async-unit-test-in-test-runner.html
        public static IEnumerator AsIEnumeratorReturnNull<T>(this Task<T> task) {
            while (!task.IsCompleted) yield return null;

            if (task.IsFaulted) ExceptionDispatchInfo.Capture(task.Exception).Throw();

            yield return null;
        }

        public static IEnumerator AsIEnumeratorReturnNull(this Task task) {
            while (!task.IsCompleted) yield return null;

            if (task.IsFaulted) ExceptionDispatchInfo.Capture(task.Exception).Throw();

            yield return null;
        }
    }
}
