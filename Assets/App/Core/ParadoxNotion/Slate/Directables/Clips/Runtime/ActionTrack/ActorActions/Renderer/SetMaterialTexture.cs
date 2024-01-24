#region
using UnityEngine;
#endregion

namespace Slate.ActionClips
{
    [Category("Renderer")]
    public class SetMaterialTexture : ActorActionClip<Renderer>
    {
        [SerializeField, HideInInspector]
        private float _length;

        [ShaderPropertyPopup(typeof(Texture))]
        public string propertyName = "_MainTex";

        public Texture texture;
        private Texture originalTexture;
        private bool temporary;

        public override string info =>
                string.Format("Set Texture\n{0}", texture ? texture.name : "null");

        public override bool isValid => actor != null
                && actor.sharedMaterial != null
                && actor.sharedMaterial.HasProperty(propertyName);

        public override float length {
            get => _length;
            set => _length = value;
        }

        private Material targetMaterial =>
                Application.isPlaying ? actor.material : actor.sharedMaterial;

        protected override void OnEnter()
        {
            temporary = length > 0;
            DoSet();
        }

        protected override void OnReverseEnter()
        {
            if (temporary) DoSet();
        }

        protected override void OnReverse()
        {
            DoReset();
        }

        protected override void OnExit()
        {
            if (temporary) DoReset();
        }

        private void DoSet()
        {
            originalTexture = targetMaterial.GetTexture(propertyName);
            targetMaterial.SetTexture(propertyName, texture);
        }

        private void DoReset()
        {
            targetMaterial.SetTexture(propertyName, originalTexture);
        }
    }
}
