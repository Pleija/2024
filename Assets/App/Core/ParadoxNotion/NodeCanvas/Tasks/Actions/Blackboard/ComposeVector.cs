#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"),
     Description("Create a new Vector out of 3 floats and save it to the blackboard")]
    public class ComposeVector : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<Vector3> saveAs;

        public BBParameter<float> x;
        public BBParameter<float> y;
        public BBParameter<float> z;
        protected override string info => "New Vector as " + saveAs;

        protected override void OnExecute()
        {
            saveAs.value = new Vector3(x.value, y.value, z.value);
            EndAction();
        }
    }
}
