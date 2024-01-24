#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Utility")]
    public class DebugDrawLine : ActionTask
    {
        public Color color = Color.white;
        public BBParameter<Vector3> from;
        public float timeToShow = 0.1f;
        public BBParameter<Vector3> to;

        protected override void OnExecute()
        {
            Debug.DrawLine(from.value, to.value, color, timeToShow);
            EndAction(true);
        }
    }
}
