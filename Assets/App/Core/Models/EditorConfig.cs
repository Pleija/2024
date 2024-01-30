using System;
using System.Collections.Generic;
using System.Linq;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UnityEditor.IMGUI.Controls;
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
            public TreeViewItem item { get; set; }
            public string itemEditName => key.Split('/').Last();
            public string itemName => key.Split('/').Last() + (levels == 0 ? "" : $" ({levels})");
        }

        [SerializeField]
        private List<TreeItem> _treeData;

        public List<TreeItem> treeData => _treeData ??= new List<TreeItem>();
    }
}
