using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Serialization;

namespace UltEvents
{
    public class AssetRefCache : ScriptableObject
    {
        [FormerlySerializedAs("value"),SerializeField]
        private AssetReference data;

        public AssetReference Value {
            get => data;
            set => data = value;
        }
#if UNITY_EDITOR
        public SerializedObject serializedObject;
        public SerializedProperty property;
#endif
    }
}
