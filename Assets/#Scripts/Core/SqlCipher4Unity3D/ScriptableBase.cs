using Sirenix.OdinInspector;
using Sirenix.Serialization;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;

namespace SqlCipher4Unity3D
{
    [ShowOdinSerializedPropertiesInInspector]
    public class ScriptableBase : ScriptableObject, ISerializationCallbackReceiver
    {
        [SerializeField, HideInInspector, Ignore]
        private SerializationData serializationData;

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            if (this == null) return;
            UnitySerializationUtility.DeserializeUnityObject(this, ref serializationData);
        }

        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            if (this == null) return;
            UnitySerializationUtility.SerializeUnityObject(this, ref serializationData);
        }
    }
}