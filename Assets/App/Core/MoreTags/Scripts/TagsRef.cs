#region
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace MoreTags
{
    [DisallowMultipleComponent]
    public class TagsRef : MonoBehaviour, ISerializationCallbackReceiver
    {
        [SerializeField]
        private List<TagData> m_tags = new List<TagData>();

        public void OnBeforeSerialize()
        {
            //Debug.Log($"Saving: {gameObject.scene.name}:{gameObject.GetPath()}");
        }

        public void OnAfterDeserialize() { }
    }
}
