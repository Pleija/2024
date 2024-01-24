#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("Input (Legacy System)")]
    public class CheckMousePick2D : ConditionTask
    {
        private int buttonID;
        public ButtonKeys buttonKey;
        private RaycastHit2D hit;
        public LayerMask mask = -1;

        [BlackboardOnly]
        public BBParameter<float> saveDistanceAs;

        [BlackboardOnly]
        public BBParameter<GameObject> saveGoAs;

        [BlackboardOnly]
        public BBParameter<Vector3> savePosAs;

        protected override string info {
            get {
                var finalString = buttonKey + " Click";
                if (!savePosAs.isNone) finalString += "\nSavePos As " + savePosAs;
                if (!saveGoAs.isNone) finalString += "\nSaveGo As " + saveGoAs;
                return finalString;
            }
        }

        protected override bool OnCheck()
        {
            buttonID = (int)buttonKey;

            if (Input.GetMouseButtonDown(buttonID)) {
                var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
                hit = Physics2D.Raycast(ray.origin, ray.direction, Mathf.Infinity, mask);

                if (hit.collider != null) {
                    savePosAs.value = hit.point;
                    saveGoAs.value = hit.collider.gameObject;
                    saveDistanceAs.value = hit.distance;
                    return true;
                }
            }
            return false;
        }
    }
}
