#region
using System;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [ExposeAsDefinition, ContextDefinedInputs(typeof(Wild), typeof(Enum)),
     ContextDefinedOutputs(typeof(Wild)), Category("Flow Controllers/Selectors"),
     Description("Select a Result value out of the input cases provided, based on an Enum")]
    public class SelectOnEnum<T> : FlowControlNode
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
                var cases = new ValueInput<T>[enumNames.Length];
                for (var i = 0; i < enumNames.Length; i++)
                    cases[i] = AddValueInput<T>("Is " + enumNames[i], enumNames[i]);
                AddValueOutput("Result", "Value", () => {
                    var enumValue = selector.value;
                    var index = (int)Enum.Parse(enumValue.GetType(), enumValue.ToString());
                    return cases[index].value;
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
