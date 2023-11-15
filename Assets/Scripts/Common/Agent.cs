using System;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using UnityEngine;

namespace Common
{
    [ShowOdinSerializedPropertiesInInspector]
    public abstract class Agent : MonoBehaviour, IDisposable, ISerializationCallbackReceiver,
        ISupportsPrefabSerialization
    {
#region Odin
        [SerializeField, HideInInspector]
        private SerializationData serializationData;

        SerializationData ISupportsPrefabSerialization.SerializationData {
            get { return this.serializationData; }
            set { this.serializationData = value; }
        }

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            if(this == null) return;
            UnitySerializationUtility.DeserializeUnityObject(this, ref this.serializationData);
        }

        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            if(this == null) return;
            UnitySerializationUtility.SerializeUnityObject(this, ref this.serializationData);
        }
#endregion

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
