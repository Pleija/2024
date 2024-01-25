#region
using System;
using System.Collections.Generic;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework
{
    [Serializable]
    public class BlackBoardData
    {
        public string Name;

        [TableList(ShowIndexLabels = true, AlwaysExpanded = true),SerializeField]
        public List<LevelData> LevelData = new List<LevelData>();

        //[OdinSerialize]
        //public Dictionary<string, int> Levels { get; set; } = new Dictionary<string, int>();

        [OdinSerialize]
        public string version { get; set; } = "1.0";

        [Button]
        private void Test() { }
    }
}
