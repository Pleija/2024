#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Keyboard Key"), Category("Events/Input (Legacy System)"),
     Description(
         "Calls respective outputs when the defined keyboard key is pressed down, held down or released")]
    public class KeyboardEvents : EventNode, IUpdatable
    {
        private FlowOutput down;
        public BBParameter<KeyCode> keyCode = KeyCode.Space;
        private FlowOutput pressed;
        private FlowOutput up;
        public override string name => string.Format("{0} [{1}]", base.name, keyCode);

        public void Update()
        {
            var value = keyCode.value;
            if (Input.GetKeyDown(value)) down.Call(new Flow());
            if (Input.GetKey(value)) pressed.Call(new Flow());
            if (Input.GetKeyUp(value)) up.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            down = AddFlowOutput("Down");
            pressed = AddFlowOutput("Pressed");
            up = AddFlowOutput("Up");
        }
    }
}
