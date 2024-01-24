#region
using System;
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace Slate
{
    [Serializable]
    ///<summary>A group of blendshapes. An expression</summary>
    public class BlendShapeGroup
    {
        [SerializeField]
        private string _UID;

        [SerializeField]
        private string _name = "(rename me)";

        [SerializeField]
        private float _weight;

        [SerializeField]
        private List<BlendShape> _blendShapes = new List<BlendShape>();

        public BlendShapeGroup() => UID = Guid.NewGuid().ToString();

        public string UID {
            get => _UID;
            private set => _UID = value;
        }

        public string name {
            get => _name;
            set => _name = value;
        }

        public float weight {
            get => _weight;
            set {
                _weight = value;
                SetBlendWeights();
            }
        }

        public List<BlendShape> blendShapes => _blendShapes;

        private void SetBlendWeights()
        {
            for (var i = 0; i < blendShapes.Count; i++) blendShapes[i].SetRealWeight(weight);
        }

        public override string ToString() => name;
    }
}
