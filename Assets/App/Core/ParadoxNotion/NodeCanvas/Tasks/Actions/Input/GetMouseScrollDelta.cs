#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Input (Legacy System)")]
    public class GetMouseScrollDelta : ActionTask
    {
        public bool repeat = false;

        [BlackboardOnly]
        public BBParameter<float> saveAs;

        protected override string info => "Get Scroll Delta as " + saveAs;

        protected override void OnExecute()
        {
            Do();
        }

        protected override void OnUpdate()
        {
            Do();
        }

        private void Do()
        {
            saveAs.value = Input.GetAxis("Mouse ScrollWheel");
            if (!repeat) EndAction();
        }
    }
}
