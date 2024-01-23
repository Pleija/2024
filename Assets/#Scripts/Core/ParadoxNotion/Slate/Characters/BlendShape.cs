using UnityEngine;
using System.Collections;

namespace Slate
{
    [System.Serializable]
    ///<summary>Parameters targeting a blendshape to be used within a BlendShapeGroup</summary>
    public class BlendShape
    {
        [SerializeField]
        private SkinnedMeshRenderer _skin;

        [SerializeField]
        private string _name;

        [SerializeField]
        private float _weight;

        public SkinnedMeshRenderer skin {
            get => _skin;
            set => _skin = value;
        }

        public string name {
            get => _name;
            set => _name = value;
        }

        public float weight {
            get => _weight;
            set => _weight = value;
        }

        public void SetRealWeight(float modWeight)
        {
            if (skin == null) return;
            var index = skin.GetBlendShapeIndex(name);
            if (index == -1) return;
            skin.SetBlendShapeWeight(index, weight * modWeight * 100);
        }

        public override string ToString() => name;
    }
}
