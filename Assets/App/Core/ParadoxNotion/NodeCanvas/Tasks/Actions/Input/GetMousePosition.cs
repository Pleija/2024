#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Input (Legacy System)")]
    public class GetMousePosition : ActionTask
    {
        public bool repeat;

        [BlackboardOnly]
        public BBParameter<Vector3> saveAs;

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
            saveAs.value = Input.mousePosition;
            if (!repeat) EndAction();
        }
    }
}
