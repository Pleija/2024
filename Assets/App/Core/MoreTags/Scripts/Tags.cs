#region
using System.Collections.Generic;
using System.Linq;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using UnityEngine;
#endregion

namespace MoreTags
{
    [AddComponentMenu("MoreTags/Tags", 0), ExecuteAlways, DefaultExecutionOrder(-10000)]
    public class Tags : View<Tags>
    {
        // public List<string> tags = new List<string>();
        [SerializeField]
        private TagDataList _tagData = new TagDataList();

        [ReadOnly]
        public List<Tags> Links = new List<Tags>();

        public TagDataList tagData => _tagData ??= new TagDataList();
        public string[] tags => tagData.data.Select(x => x.name).ToArray();
#if UNITY_EDITOR
        public TagGUI tagGUI { get; set; }
#endif

        private void Awake()
        {
            var root = transform.root.RequireComponent<Tags>();

            if (!root.Links.Contains(this) || root == this) {
                root.Links.RemoveAll(t => !t);
                var add = GetComponentsInChildren<Tags>(true)
                        .Where(x => !root.Links.Contains(x))
                        .ToArray();
                root.Links.AddRange(add);
                (root == this ? Links.ToArray() : add).ForEach(x => x.gameObject.AddTag(x.tags));
            }
        }

        public void AddTag(params string[] value)
        {
            value.Where(x => !tags.Contains(x))
                    .ForEach(x => tagData.data.Add(new TagData { name = x }));
        }

#if UNITY_EDITOR
        private void CheckSingle()
        {
            foreach (var comp in GetComponents<Tags>())
                if (comp != this)
                    DestroyImmediate(this);
        }

        private void Reset()
        {
            Invoke(nameof(CheckSingle), 0);
        }
#endif
    }
}
