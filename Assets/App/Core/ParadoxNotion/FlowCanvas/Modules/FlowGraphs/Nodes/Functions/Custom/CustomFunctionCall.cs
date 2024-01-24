#region
using System;
using System.Linq;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEditor;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [DoNotList, Name("Function Call"), Description("Calls an existing Custom Function"),
     Category("Functions/Custom"), DeserializeFrom("FlowCanvas.Nodes.RelayFlowInput"),
     HasRefreshButton]
    public class CustomFunctionCall : FlowControlNode
    {
        private WeakReference<CustomFunctionEvent> _sourceFunctionRef;

        [SerializeField]
        private string _sourceOutputUID;

        private FlowOutput fOut;
        private object[] objectArgs;
        private ValueInput[] portArgs;
        private object returnValue;

        private string sourceFunctionUID {
            get => _sourceOutputUID;
            set => _sourceOutputUID = value;
        }

        public CustomFunctionEvent sourceFunction {
            get {
                CustomFunctionEvent reference;

                if (_sourceFunctionRef == null) {
                    reference = graph.GetAllNodesOfType<CustomFunctionEvent>()
                            .FirstOrDefault(i => i.UID == sourceFunctionUID);
                    _sourceFunctionRef = new WeakReference<CustomFunctionEvent>(reference);
                }
                _sourceFunctionRef.TryGetTarget(out reference);
                return reference;
            }
        }

        public override string name => string.Format("Call {0} ()",
            sourceFunction != null ? sourceFunction.identifier : "NONE");

        public override string description =>
                sourceFunction != null && !string.IsNullOrEmpty(sourceFunction.comments)
                        ? sourceFunction.comments : base.description;

        //...
        public void SetFunction(CustomFunctionEvent func)
        {
            _sourceOutputUID = func != null ? func.UID : null;
            _sourceFunctionRef = new WeakReference<CustomFunctionEvent>(func);
            GatherPorts();
        }

        //...
        protected override void RegisterPorts()
        {
            AddFlowInput(SPACE, Invoke);

            if (sourceFunction != null) {
                var parameters = sourceFunction.parameters;
                portArgs = new ValueInput[parameters.Count];

                for (var _i = 0; _i < parameters.Count; _i++) {
                    var i = _i;
                    var parameter = parameters[i];
                    portArgs[i] = AddValueInput(parameter.name, parameter.type, parameter.ID);
                }
                if (sourceFunction.returns.type != null)
                    AddValueOutput(sourceFunction.returns.name, sourceFunction.returns.ID,
                        sourceFunction.returns.type, () => {
                            return returnValue;
                        });
                fOut = AddFlowOutput(SPACE);
            }
        }

        //...
        private void Invoke(Flow f)
        {
            if (sourceFunction != null) {
                if (objectArgs == null) objectArgs = new object[portArgs.Length];
                for (var i = 0; i < portArgs.Length; i++) objectArgs[i] = portArgs[i].value;
                sourceFunction.InvokeAsync(f, fx => {
                    returnValue = sourceFunction.GetReturnValue();
                    fOut.Call(fx);
                }, objectArgs);
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeExternalGUI()
        {
            if (sourceFunction != null && isSelected) {
                Handles.color = Color.grey;
                Handles.DrawAAPolyLine(rect.center, sourceFunction.rect.center);
                Handles.color = Color.white;
            }
        }

        protected override void OnNodeInspectorGUI()
        {
            if (sourceFunction == null) {
                var functions = graph.GetAllNodesOfType<CustomFunctionEvent>();
                var currentFunc = functions.FirstOrDefault(i => i.UID == sourceFunctionUID);
                var newFunc = EditorUtils.Popup("Target Function", currentFunc, functions);
                if (newFunc != currentFunc) SetFunction(newFunc);
            }
            base.OnNodeInspectorGUI();
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
