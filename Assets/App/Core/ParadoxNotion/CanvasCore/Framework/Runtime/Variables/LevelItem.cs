using System;
using UnityEngine;

namespace NodeCanvas.Framework
{
    [Serializable]
    public class LevelItem
    {
        public float plus;     // 加值
        public float multiply; // 倍数
        public Variable variable;
        public string name => variable?.name;
        public Color color => variable.color;
    }
}
