#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Mouse Pick"), Category("Events/Input (Legacy System)"),
     Description(
         "Called when any collider is clicked with the specified mouse button. PickInfo contains the information of the raycast event")]
    public class MousePickEvent : EventNode, IUpdatable
    {
        public enum ButtonKeys { Left = 0, Right = 1, Middle = 2 }
        public BBParameter<ButtonKeys> buttonKey;
        private RaycastHit hit;
        public BBParameter<LayerMask> mask = new BBParameter<LayerMask>(-1);
        private FlowOutput o;
        public override string name => string.Format("{0} [{1}]", base.name, buttonKey);

        public void Update()
        {
            if (Input.GetMouseButtonDown((int)buttonKey.value))
                if (Physics.Raycast(Camera.main.ScreenPointToRay(Input.mousePosition), out hit,
                    Mathf.Infinity,
                    mask.value))
                    o.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            o = AddFlowOutput("Object Picked");
            AddValueOutput("Pick Info", () => {
                return hit;
            });
        }
    }
}
