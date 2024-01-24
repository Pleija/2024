#region
using System;
using System.Collections;
using System.Collections.Generic;
using ParadoxNotion;
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Description(
         "Enumerate a value (usualy a list or array) for each of it's elements. Remember that you can also enumerate a Transform for it's children."),
     Category("Flow Controllers/Iterators"), ContextDefinedInputs(typeof(IEnumerable)),
     ContextDefinedOutputs(typeof(object))]
    public class ForEach : FlowControlNode
    {
        private bool broken;
        private int currentIndex;
        private object currentObject;
        private ValueInput<IEnumerable> enumerableInput;

        protected override void RegisterPorts()
        {
            enumerableInput = AddValueInput<IEnumerable>("Value");
            AddValueOutput("Current", () => {
                return currentObject;
            });
            AddValueOutput("Index", () => {
                return currentIndex;
            });
            var fCurrent = AddFlowOutput("Do");
            var fFinish = AddFlowOutput("Done");
            AddFlowInput("In", f => {
                currentIndex = -1;
                var li = enumerableInput.value;

                if (li == null) {
                    fFinish.Call(f);
                    return;
                }
                broken = false;
                f.BeginBreakBlock(() => {
                    broken = true;
                });

                foreach (var o in li) {
                    if (broken) break;
                    currentObject = o;
                    currentIndex++;
                    fCurrent.Call(f);
                }
                f.EndBreakBlock();
                fFinish.Call(f);
            });
            AddFlowInput("Break", f => {
                broken = true;
            });
        }

        public override Type GetNodeWildDefinitionType() => typeof(IEnumerable);

        public override void OnPortConnected(Port port, Port otherPort)
        {
            if (port == enumerableInput) {
                var elementType = otherPort.type.GetEnumerableElementType();
                if (elementType != null)
                    ReplaceWith(typeof(ForEach<>).RTMakeGenericType(elementType));
            }
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Description("Enumerate a value (usualy a list or array) for each of it's elements"),
     Category("Flow Controllers/Iterators"), ContextDefinedOutputs(typeof(Wild)),
     ExposeAsDefinition]
    public class ForEach<T> : FlowControlNode
    {
        private bool broken;
        private int currentIndex;
        private T currentObject;

        protected override void RegisterPorts()
        {
            var list = AddValueInput<IEnumerable<T>>("Value");
            AddValueOutput("Current", () => {
                return currentObject;
            });
            AddValueOutput("Index", () => {
                return currentIndex;
            });
            var fCurrent = AddFlowOutput("Do");
            var fFinish = AddFlowOutput("Done");
            AddFlowInput("In", f => {
                currentIndex = -1;
                var li = list.value;

                if (li == null) {
                    fFinish.Call(f);
                    return;
                }
                broken = false;
                f.BeginBreakBlock(() => {
                    broken = true;
                });

                foreach (var o in li) {
                    if (broken) break;
                    currentObject = o;
                    currentIndex++;
                    fCurrent.Call(f);
                }
                f.EndBreakBlock();
                fFinish.Call(f);
            });
            AddFlowInput("Break", f => {
                broken = true;
            });
        }
    }
}
