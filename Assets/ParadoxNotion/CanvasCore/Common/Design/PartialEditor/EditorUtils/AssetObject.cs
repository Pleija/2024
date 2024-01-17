using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace ParadoxNotion
{
    public class AssetObject : ScriptableObject
    {
        [SerializeField]
        AssetReference value;
#if UNITY_EDITOR
        public SerializedObject serializedObject;
        public SerializedProperty property;
#endif
        public string path;

        public AssetReference Reference {
            get => value;
            set => value = this.value;
        }
    }
}
