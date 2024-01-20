using System.Collections.Generic;
using System.Linq;
using Sirenix.Utilities;
using UnityEngine;

namespace MoreTags
{
    [AddComponentMenu("MoreTags/Tags", 0)]
    public class Tags : MonoBehaviour
    {
        // public List<string> tags = new List<string>();
        [SerializeField]
        private List<TagData> _tagData = new List<TagData>();

        public List<TagData> tagData => _tagData ??= new List<TagData>();
        public string[] tags => tagData.Select(x => x.name).ToArray();
#if UNITY_EDITOR
        public TagGUI tagGUI { get; set; }
#endif

        public void AddTag(params string[] value)
        {
            value.Where(x => !tags.Contains(x)).ForEach(x => tagData.Add(new TagData() { name = x }));
        }

        private void Awake()
        {
            gameObject.AddTag(tags);
        }

#if UNITY_EDITOR
        private void CheckSingle()
        {
            foreach (var comp in GetComponents<Tags>())
                if (comp != this) {
                    DestroyImmediate(this);
                }
        }

        private void Reset()
        {
            Invoke(nameof(CheckSingle), 0);
        }
#endif
    }
}
