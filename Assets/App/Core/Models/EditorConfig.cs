using System;
using System.Collections.Generic;
using System.Linq;
using Sirenix.Serialization;
using SqlCipher4Unity3D;

#if UNITY_EDITOR
using UnityEditor.IMGUI.Controls;

#endif
using UnityEngine;

namespace Models
{
    public class EditorConfig : DbTable<EditorConfig>
    {
        [Serializable]
        public class TreeItem
        {
            public string key;
            public string guid;
            public string desc;
            public int levels;
#if UNITY_EDITOR
             public TreeViewItem item { get; set; }

#endif
            public string itemEditName => key.Split('/').Last();
            public string itemName => key.Split('/').Last() + (levels == 0 ? "" : $" ({levels})");
        }

        [SerializeField]
        private List<TreeItem> _treeData;

        public List<TreeItem> treeData => _treeData ??= new List<TreeItem>();
    }
}
