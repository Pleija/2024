using System.Collections.Generic;
using UnityEngine;

namespace MoreTags
{
    [AddComponentMenu("MoreTags/Prefab Tags", 0), ExecuteInEditMode]
    public class PrefabTags : MonoBehaviour
    {
        public List<string> Tags = new List<string>();

        private void Awake()
        {
            gameObject.AddTag(Tags.ToArray());
            RemoveSelf();
        }

#if UNITY_EDITOR
        private void Reset()
        {
            Invoke(nameof(RemoveSelf), 0);
        }
#endif
        private void RemoveSelf()
        {
#if UNITY_EDITOR
            DestroyImmediate(this);
#else
            Destroy(this);
#endif
        }
    }
}
