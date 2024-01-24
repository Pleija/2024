#region
using System.Collections.Generic;
using System.Linq;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Variables/New"), Description("Create a collection of <T> objects"),
     ContextDefinedInputs(typeof(Wild)), ContextDefinedOutputs(typeof(List<>))]
    public class CreateCollection<T> : FlowNode
    {
        [SerializeField, ExposeField, MinValue(2), DelayedField, GatherPortsCallback]
        private int _portCount = 4;

        protected override void RegisterPorts()
        {
            var ins = new List<ValueInput<T>>();
            for (var i = 0; i < _portCount; i++) ins.Add(AddValueInput<T>("Element" + i));
            AddValueOutput("Collection", () => {
                return ins.Select(p => p.value).ToArray();
            });
        }
    }
}
