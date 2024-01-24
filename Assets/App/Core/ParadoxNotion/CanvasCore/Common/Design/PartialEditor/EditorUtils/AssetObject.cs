#region
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
#endregion

namespace ParadoxNotion
{
    public class AssetObject : ScriptableObject
    {
        [SerializeField]
        private AssetReference value;

        public string path;
        public AssetReference Reference {
            get => value;
            set => value = this.value;
        }
#if UNITY_EDITOR
        public SerializedObject serializedObject;
        public SerializedProperty property;
#endif
    }
}
