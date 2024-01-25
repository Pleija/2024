using System;
using System.Collections.Generic;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using UnityEngine;

namespace NodeCanvas.Framework
{
    [Serializable]
    public class LevelData
    {
        [TableColumnWidth(100, false)]
        public string Id;

        [TableColumnWidth(50, false)]
        public int Level;

        [TableColumnWidth(20, false)]
        public bool enable;

        public string desc;

        [HideInTables]
        public List<LevelItem> items = new List<LevelItem>();
    }
}
