using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

namespace MoreTags
{
    [Serializable]
    public class TagDataList
    {
        public List<TagData> data = new List<TagData>();
#if UNITY_EDITOR
        public TagGUI tagGUI { get; set; }
#endif
    }

    [Serializable]
    public class TagData
    {
        public string name;
        public string value;
        public int cost;
        public int number;
        public bool enable;
        public Color color;
        public GameObject[] gameObjects;
    }

    [CreateAssetMenu(fileName = "TagManager", menuName = "Custom/TagManager", order = 0)]
    public class TagManager : ScriptableObject, ISerializationCallbackReceiver
    {
        private static TagManager m_Instance;

        public static TagManager self {
            get {
                if (m_Instance == null) m_Instance = Resources.Load<TagManager>("TagManager");
                return m_Instance;
            }
            set => m_Instance = value;
        }

        [SerializeField]
        private List<TagData> m_tags = new List<TagData>();

        public void AddTag(params string[] tags)
        {
            var newList = tags.Where(tag => m_tags.All(x => x.name != tag)).ToArray();
            if (!newList.Any()) return;
            newList.ForEach(x => m_tags.Add(new TagData() { name = x }));
#if UNITY_EDITOR
            EditorUtility.SetDirty(this);
#endif
        }

        public void RenameTag(string old, string tag)
        {
            if (string.IsNullOrEmpty(tag)) return;
            if (m_tags.Any(x => x.name == tag)) return;
            var item = m_tags.FirstOrDefault(x => x.name == old);
            if (item == null) return;
            item.name = tag;
#if UNITY_EDITOR
            EditorUtility.SetDirty(this);
#endif
        }

        public void RemoveTag(params string[] tags)
        {
            m_tags.RemoveAll(x => tags.Contains(x.name));
#if UNITY_EDITOR
            EditorUtility.SetDirty(this);
#endif
        }

        private void OnEnable()
        {
            //if(m_Instance != null) return;
            m_Instance = this;
            //Debug.Log("[TagManager] Load");
            // var tm = FindObjectsOfType<TagManager>();
            // if (tm.Length == 0 || (tm.Length == 1 && tm[0] == this))
            //TagSystem.Reset();
            TagSystem.LoadDataToTable(m_tags);
        }

        public void OnAfterDeserialize()
        {
            TagSystem.LoadDataToTable(m_tags);
        }

        public void OnBeforeSerialize()
        {
            //if (gameObject == null) return;
            TagSystem.BeforeSerialize(ref m_tags /*, gameObject.scene*/);
#if UNITY_EDITOR
            EditorUtility.SetDirty(this);
#endif
        }
    }
}
