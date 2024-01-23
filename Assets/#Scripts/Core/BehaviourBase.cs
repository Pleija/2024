using System;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using UnityEditor;
using UnityEngine;

[ShowOdinSerializedPropertiesInInspector]
public abstract class BehaviourBase : MonoBehaviour, ISerializationCallbackReceiver, ISupportsPrefabSerialization
{
#region Odin
    [SerializeField, HideInInspector]
    private SerializationData serializationData;

    SerializationData ISupportsPrefabSerialization.SerializationData {
        get => serializationData;
        set => serializationData = value;
    }

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
#endregion

    //public static bool isQuitting;

    //     [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    //     private static void BaseConfigOnLoad()
    //     {
    //         Application.quitting += () => isQuitting = true;
    // #if UNITY_EDITOR
    //         EditorApplication.playModeStateChanged += mode => isQuitting = false;
    // #endif
    //     }

    [AttributeUsage(AttributeTargets.Class)]
    public class AutoCreateAttribute : Attribute { }

    [AttributeUsage(AttributeTargets.Class)]
    public class DontDestroyOnLoadAttribute : Attribute { }

    // public virtual void Dispose()
    // {
    //     // TODO 在此释放托管资源
    // }
    public virtual void OnEnable() { }
}
