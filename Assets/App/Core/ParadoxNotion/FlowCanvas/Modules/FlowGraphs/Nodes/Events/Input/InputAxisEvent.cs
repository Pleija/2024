#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Input Axis (Preset)"), Category("Events/Input (Legacy System)"),
     Description("Calls out when Horizontal or Vertical Input Axis is not zero"),
     Obsolete("Use Input Axis")]
    public class InputAxisEvent : EventNode, IUpdatable
    {
        private bool calledLastFrame;
        private float horizontal;
        private FlowOutput o;
        private float vertical;

        public void Update()
        {
            horizontal = Input.GetAxis("Horizontal");
            vertical = Input.GetAxis("Vertical");

            if (horizontal != 0 || vertical != 0) {
                o.Call(new Flow());
                calledLastFrame = true;
            }

            //this is done to also call actual 0
            if (horizontal == 0 && vertical == 0 && calledLastFrame) {
                o.Call(new Flow());
                calledLastFrame = false;
            }
        }

        protected override void RegisterPorts()
        {
            o = AddFlowOutput("Out");
            AddValueOutput("Horizontal", () => {
                return horizontal;
            });
            AddValueOutput("Vertical", () => {
                return vertical;
            });
        }
    }
}
