#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard")]
    public class NormalizeVector : ActionTask
    {
        public BBParameter<float> multiply = 1;
        public BBParameter<Vector3> targetVector;

        protected override void OnExecute()
        {
            targetVector.value = targetVector.value.normalized * multiply.value;
            EndAction(true);
        }
    }
}
