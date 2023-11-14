using System;
using Sirenix.OdinInspector;
using UnityEngine;

namespace Common
{
    [ShowOdinSerializedPropertiesInInspector]
    public abstract class Agent : MonoBehaviour, IDisposable
    {
        [AttributeUsage(AttributeTargets.Class)]
        public class AutoCreateAttribute : Attribute { }

        [AttributeUsage(AttributeTargets.Class)]
        public class DontDestroyOnLoadAttribute : Attribute { }

        public virtual void Dispose()
        {
            // TODO 在此释放托管资源
        }
    }

    public class AgentSample : Agent<AgentSample> { }

    public class Agent<T> : Agent where T : Agent<T>
    {
        public virtual void OnEnable() { }
    }
}
