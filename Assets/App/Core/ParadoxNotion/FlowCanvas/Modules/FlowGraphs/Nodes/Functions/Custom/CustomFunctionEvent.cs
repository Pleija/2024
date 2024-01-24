#region
using System;
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEditor;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("New Custom Function", 10),
     Description(
         "A custom function, defined by any number of parameters and an optional return value. It can be called using the 'Call Custom Function' node. To end the function and optionally return a value, the 'Return' node should be used."),
     Category("Functions/Custom"), DeserializeFrom("FlowCanvas.Nodes.RelayFlowOutput")]
    public class CustomFunctionEvent : EventNode, IInvokable, IEditorMenuCallbackReceiver
    {
        [SerializeField]
        private List<DynamicParameterDefinition> _parameters =
                new List<DynamicParameterDefinition>();

        [SerializeField]
        private DynamicParameterDefinition _returns = new DynamicParameterDefinition("Value", null);

        private object[] args;

        [DelayedField, Tooltip("The identifier name of the function")]
        public string identifier = "MyFunction";

        private FlowOutput onInvoke;
        private object returnValue;

        ///<summary>the parameters port definition</summary>
        public List<DynamicParameterDefinition> parameters {
            get => _parameters;
            private set => _parameters = value;
        }

        ///<summary>the return port definition</summary>
        public DynamicParameterDefinition returns {
            get => _returns;
            private set => _returns = value;
        }

        //shortcut
        private Type returnType => returns.type;

        //shortcut
        private Type[] parameterTypes {
            get { return parameters.Select(p => p.type).ToArray(); }
        }

        public override string name => "➥ " + identifier;
        string IInvokable.GetInvocationID() => identifier;
        object IInvokable.Invoke(params object[] args) => Invoke(new Flow(), args);

        void IInvokable.InvokeAsync(Action<object> callback, params object[] args)
        {
            InvokeAsync(new Flow(), f => {
                callback(returnValue);
            }, args);
        }

        public override void OnGraphStoped()
        {
            returnValue = null;
            args = null;
        }

        protected override void RegisterPorts()
        {
            onInvoke = AddFlowOutput(" ");

            for (var _i = 0; _i < parameters.Count; _i++) {
                var i = _i;
                var parameter = parameters[i];
                AddValueOutput(parameter.name, parameter.ID, parameter.type, () => {
                    return args[i];
                });
            }
        }

        ///<summary>Invokes the function and return it's return value</summary>
        public object Invoke(Flow f, params object[] args)
        {
            this.args = args;
            FlowReturn returnCallback = o => {
                returnValue = o;
            };
            var invocationFlow = new Flow();
            invocationFlow.BeginAwaitReturn(returnCallback, returns.type);
            onInvoke.Call(invocationFlow);
            return returnValue;
        }

        ///<summary>Invokes the function and callbacks when a Return node is hit.</summary>
        public void InvokeAsync(Flow f, FlowHandler flowCallback, params object[] args)
        {
            this.args = args;
            FlowReturn returnCallback = o => {
                returnValue = o;
                flowCallback(f);
            };
            var invocationFlow = new Flow();
            invocationFlow.BeginAwaitReturn(returnCallback, returns.type);
            onInvoke.Call(invocationFlow);
        }

        ///<summary>Returns the function's last return value</summary>
        public object GetReturnValue() => returnValue;

        //Add a parameter to the function
        private void AddParameter(Type type)
        {
            parameters.Add(new DynamicParameterDefinition(type.FriendlyName(), type));
            GatherPortsUpdateRefs();
        }

        //Helper
        private void GatherPortsUpdateRefs()
        {
            GatherPorts();
            foreach (var call in flowGraph.GetAllNodesOfType<CustomFunctionCall>()
                    .Where(n => n.sourceFunction == this))
                call.GatherPorts();
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        void IEditorMenuCallbackReceiver.OnMenu(GenericMenu menu, Vector2 pos, Port contextPort,
            object dropInstance)
        {
            if (contextPort != null) {
                if (contextPort is ValueInput && !contextPort.type.IsAssignableFrom(returnType))
                    return;
                if (contextPort is ValueOutput
                    && !parameterTypes.Any(t => t.IsAssignableFrom(contextPort.type)))
                    return;
            }
            menu.AddItem(new GUIContent(string.Format("Functions/Custom/Call '{0}()'", identifier)),
                false,
                () => {
                    flowGraph.AddFlowNode<CustomFunctionCall>(pos, contextPort, dropInstance)
                            .SetFunction(this);
                });
        }

        protected override void OnNodeInspectorGUI()
        {
            base.OnNodeInspectorGUI();
            if (GUILayout.Button("Add Parameter"))
                EditorUtils.ShowPreferedTypesSelectionMenu(typeof(object), t => {
                    AddParameter(t);
                });
            EditorGUI.BeginChangeCheck();
            var options = new EditorUtils.ReorderableListOptions();
            options.allowRemove = true;
            EditorUtils.ReorderableList(parameters, options, (i, r) => {
                var parameter = parameters[i];
                GUILayout.BeginHorizontal();
                parameter.name = EditorGUILayout.DelayedTextField(parameter.name,
                    GUILayout.Width(150), GUILayout.ExpandWidth(true));
                EditorUtils.ButtonTypePopup("", parameter.type, t => {
                    parameter.type = t;
                    GatherPortsUpdateRefs();
                });
                GUILayout.EndHorizontal();
            });
            EditorUtils.Separator();
            EditorUtils.ButtonTypePopup("Return Type", returns.type, t => {
                returns.type = t;
                GatherPortsUpdateRefs();
            });
            if (EditorGUI.EndChangeCheck()) GatherPortsUpdateRefs();
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
