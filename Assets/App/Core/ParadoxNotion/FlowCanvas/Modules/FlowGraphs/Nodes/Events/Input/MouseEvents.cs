#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Mouse Button"), Category("Events/Input (Legacy System)"),
     Description("Called when the specified mouse button is clicked down, held or released")]
    public class MouseEvents : EventNode, IUpdatable
    {
        public enum ButtonKeys { Left = 0, Right = 1, Middle = 2 }
        public BBParameter<ButtonKeys> buttonKey;
        private FlowOutput down;
        private FlowOutput pressed;
        private FlowOutput up;
        public override string name => string.Format("{0} [{1}]", base.name, buttonKey);

        public void Update()
        {
            var value = (int)buttonKey.value;
            if (Input.GetMouseButtonDown(value)) down.Call(new Flow());
            if (Input.GetMouseButton(value)) pressed.Call(new Flow());
            if (Input.GetMouseButtonUp(value)) up.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            down = AddFlowOutput("Down");
            pressed = AddFlowOutput("Pressed");
            up = AddFlowOutput("Up");
        }
    }
}
