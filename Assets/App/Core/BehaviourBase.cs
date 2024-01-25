#region
using System;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using UnityEngine;
#endregion

public class View<T> : BehaviourBase where T : View<T> { }

[ShowOdinSerializedPropertiesInInspector]
public abstract class BehaviourBase : MonoBehaviour, ISerializationCallbackReceiver,
        ISupportsPrefabSerialization
{
    // public virtual void Dispose()
    // {
    //     // TODO 在此释放托管资源
    // }
    public virtual void OnEnable() { }

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
}
