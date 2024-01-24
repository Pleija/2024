#region
using System;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Switch Integer (Legacy)"), Category("Flow Controllers/Switchers"),
     Description(
         "Branch the Flow based on an integer value. The Default output is called when the Index value is out of range."),
     ContextDefinedInputs(typeof(int)), Obsolete("Use Switch Integer")]
    public class SwitchInt : FlowControlNode
    {
        [SerializeField, ExposeField, GatherPortsCallback, MinValue(2), DelayedField]
        private int _portCount = 4;

        protected override void RegisterPorts()
        {
            var selector = AddValueInput<int>("Value", "Index");
            var cases = new FlowOutput[_portCount];
            for (var i = 0; i < cases.Length; i++) cases[i] = AddFlowOutput(i.ToString());
            var defaultCase = AddFlowOutput("Default");
            AddFlowInput("In", f => {
                var i = selector.value;
                f.Call(i >= 0 && i < cases.Length ? cases[i] : defaultCase);
            });
        }
    }
}
