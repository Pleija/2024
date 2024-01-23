using System.Collections.Generic;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UnityEngine;

namespace NodeCanvas.Framework
{
    public class BlackBoardData : DataModel<BlackBoardData>
    {
        [OdinSerialize] public Dictionary<string, int> Level { get; set; } = new Dictionary<string, int>();
        [OdinSerialize] public string version { get; set; } = "1.0";

        [Button]
        void Test() { }
    }
}
