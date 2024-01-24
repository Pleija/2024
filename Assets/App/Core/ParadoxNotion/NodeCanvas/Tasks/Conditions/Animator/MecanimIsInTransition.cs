#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Name("Is In Transition"), Category("Animator")]
    public class MecanimIsInTransition : ConditionTask<Animator>
    {
        public BBParameter<int> layerIndex;
        protected override string info => "Mec.Is In Transition";
        protected override bool OnCheck() => agent.IsInTransition(layerIndex.value);
    }
}
