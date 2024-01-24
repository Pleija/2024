#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Input (Legacy System)")]
    public class WaitMousePick : ActionTask
    {
        public enum ButtonKeys { Left = 0, Right = 1, Middle = 2 }
        private int buttonID;
        public ButtonKeys buttonKey;
        private RaycastHit hit;
        public LayerMask mask = -1;

        [BlackboardOnly]
        public BBParameter<float> saveDistanceAs;

        [BlackboardOnly]
        public BBParameter<GameObject> saveObjectAs;

        [BlackboardOnly]
        public BBParameter<Vector3> savePositionAs;

        protected override string info => string.Format("Wait Object '{0}' Click. Save As {1}",
            buttonKey, saveObjectAs);

        protected override void OnUpdate()
        {
            buttonID = (int)buttonKey;

            if (Input.GetMouseButtonDown(buttonID))
                if (Physics.Raycast(Camera.main.ScreenPointToRay(Input.mousePosition), out hit,
                    Mathf.Infinity, mask)) {
                    savePositionAs.value = hit.point;
                    saveObjectAs.value = hit.collider.gameObject;
                    saveDistanceAs.value = hit.distance;
                    EndAction(true);
                }
        }
    }
}
