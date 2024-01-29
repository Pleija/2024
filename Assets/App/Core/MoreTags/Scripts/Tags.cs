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

        public bool checkUpdate;
        public TagDataList tagData => _tagData ??= new TagDataList();
        public IEnumerable<string> tags => tagData.data.Select(x => x.name);
#if UNITY_EDITOR
        public TagGUI tagGUI { get; set; }
#endif

        public void Awake()
        {
            if (Application.isPlaying) {
                foreach (var comp in GetComponents<Tags>())
                    if (comp != this) {
                        comp._tagData.data.Where(x => !tags.Contains(x.name))
                            .ForEach(x => _tagData.data.Add(x));
                        comp.DestroySelf();
                    }
            }
            var root = transform.root.RequireComponent<Tags>();

            if (!root.Links.Contains(this) || root == this) {
                root.Links.RemoveAll(t => !t);
                var add = GetComponentsInChildren<Tags>(true)
                    .Where(x => !root.Links.Contains(x))
                    .ToArray();
                root.Links.AddRange(add);
                (root == this ? Links.ToArray() : add).ForEach(x =>
                    x.gameObject.AddTag(x.tags.ToArray()));
            }

            if (Application.isPlaying && tags.Any()) {
                gameObject.CheckGroup(t => t.onAdd.Invoke(this));
            }
        }

        public override void OnEnable()
        {
            base.OnEnable();

            if (Application.isPlaying && tags.Any()) {
                gameObject.CheckGroup(t => t.onEnable.Invoke(this));
            }
        }

        public void OnDisable()
        {
            if (Application.isPlaying && tags.Any()) {
                gameObject.CheckGroup(t => t.onDisable.Invoke(this));
            }
        }

        public void OnDestroy()
        {
            if (!Application.isPlaying) return;
            tags.ToList().ForEach(t => gameObject.RemoveTag(t));

            if (tags.Any()) {
                gameObject.CheckGroup(t => t.onRemove.Invoke(this));
            }
        }

        public void Update()
        {
            if (!Application.isPlaying) return;

            if (checkUpdate && tags.Any()) {
                gameObject.CheckGroup(t => t.onUpdate.Invoke(this));
            }
        }

        public void RemoveTags(params string[] value)
        {
            value.Where(x => tags.Contains(x))
                .ForEach(t => {
                    TagSystem.Groups.Where(kv => kv.Key.SetEquals(tags))
                        .ForEach(item => {
                            item.Value.onRemove.Invoke(this);
                        });
                    tagData.data.RemoveAll(x => x.name == t);
                });
        }

        public void AddTags(params string[] value)
        {
            value.Where(x => !tags.Contains(x))
                .ForEach(x => {
                    tagData.data.Add(new TagData { name = x });
                });

            if (Application.isPlaying && tags.Any()) {
                gameObject.CheckGroup(t => t.onAdd.Invoke(this));
            }
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
