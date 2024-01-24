#region
using System;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("XOR"), Category("Flow Controllers/Flow Merge"),
     Description(
         "Calls Out when either single Input is called, but no other is in the same frame."),
     Obsolete]
    public class XORMerge : FlowControlNode
    {
        [SerializeField, ExposeField, GatherPortsCallback, MinValue(2), DelayedField]
        private int _portCount = 2;

        private int[] calls;
        private FlowOutput fOut;
        private int lastFrameCall;

        protected override void RegisterPorts()
        {
            calls = new int[_portCount];
            fOut = AddFlowOutput("Out");

            for (var _i = 0; _i < _portCount; _i++) {
                var i = _i;
                AddFlowInput(i.ToString(), f => {
                    Check(i, f);
                });
            }
        }

        private void Check(int index, Flow f)
        {
            calls[index] = Time.frameCount;
            for (var i = 0; i < calls.Length; i++)
                if (i != index)
                    if (calls[i] == lastFrameCall)
                        return;
            fOut.Call(f);
            lastFrameCall = Time.frameCount;
        }
    }
}
