#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("GameObject")]
    public class IsWithinLayerMask : ConditionTask<Transform>
    {
        public BBParameter<LayerMask> targetLayers;
        protected override bool OnCheck() => agent.gameObject.IsInLayerMask(targetLayers.value);
    }
}
