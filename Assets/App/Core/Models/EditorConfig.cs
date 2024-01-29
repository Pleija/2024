using System.Collections.Generic;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UnityEngine;

namespace Models
{
    public class EditorConfig : DbTable<EditorConfig>
    {
        [OdinSerialize]
        private Dictionary<string, (string guid, string desc, int levels)> _treeData;

        public Dictionary<string, (string guid, string desc, int levels)> treeData {
            get => _treeData ??= new Dictionary<string, (string guid, string desc, int levels)>();
        }
    }
}
