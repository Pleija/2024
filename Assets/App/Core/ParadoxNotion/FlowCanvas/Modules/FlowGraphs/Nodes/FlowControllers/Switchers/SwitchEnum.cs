#region
using System;
using System.Collections.Generic;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Flow Controllers/Switchers"),
     Description(
         "Branch the Flow based on an enum value.\nPlease connect an Enum first for the options to show, or directly select the enum type with the relevant button bellow."),
     ContextDefinedInputs(typeof(Enum))]
    public class SwitchEnum : FlowControlNode
    {
        [SerializeField]
        private SerializedTypeInfo _type;

        private Type type {
            get => _type;
            set {
                if (_type != value) _type = new SerializedTypeInfo(value);
            }
        }

        protected override void RegisterPorts()
        {
            if (type == null) type = typeof(Enum);
            var selector = AddValueInput(type.Name, type, "Enum");

            if (type != typeof(Enum)) {
                var enumNames = Enum.GetNames(type);
                var cases = new Dictionary<string, FlowOutput>(enumNames.Length);
                for (var i = 0; i < enumNames.Length; i++)
                    cases[enumNames[i]] = AddFlowOutput(enumNames[i]);
                AddFlowInput("In", f => {
                    cases[selector.value.ToString()].Call(f);
                });
            }
        }

        public override Type GetNodeWildDefinitionType() => typeof(Enum);

        public override void OnPortConnected(Port port, Port otherPort)
        {
            if (type == typeof(Enum))
                if (typeof(Enum).RTIsAssignableFrom(otherPort.type)) {
                    type = otherPort.type;
                    GatherPorts();
                }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeInspectorGUI()
        {
            base.OnNodeInspectorGUI();
            if (GUILayout.Button("Select Enum Type"))
                EditorUtils.ShowPreferedTypesSelectionMenu(typeof(Enum), t => {
                    type = t;
                    GatherPorts();
                });
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
