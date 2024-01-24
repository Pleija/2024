#region
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject"), Description("Action will end in Failure if no objects are found")]
    public class FindAllWithLayer : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<List<GameObject>> saveAs;

        [RequiredField]
        public BBParameter<LayerMask> targetLayers;

        protected override string info => "GetObjects in '" + targetLayers + "' as " + saveAs;

        protected override void OnExecute()
        {
            saveAs.value = ObjectUtils.FindGameObjectsWithinLayerMask(targetLayers.value).ToList();
            EndAction(saveAs.value.Count != 0);
        }
    }
}
