#region
using System;
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace FlowCanvas.Macros
{
    [CreateAssetMenu(menuName = "ParadoxNotion/FlowCanvas/Macro Asset")]
    public class Macro : FlowScriptBase
    {
        ///----------------------------------------------------------------------------------------------
        //we need to let Unity serialize these as to be available OnAfterDeserialize regardless or order of execution
        [SerializeField]
        public List<DynamicParameterDefinition> inputDefinitions =
                new List<DynamicParameterDefinition>();

        [SerializeField]
        public List<DynamicParameterDefinition> outputDefinitions =
                new List<DynamicParameterDefinition>();

        private MacroInputNode _entry;
        private MacroOutputNode _exit;

        ///----------------------------------------------------------------------------------------------
        [NonSerialized]
        public Dictionary<string, FlowHandler> entryActionMap =
                new Dictionary<string, FlowHandler>(StringComparer.Ordinal);

        [NonSerialized]
        public Dictionary<string, ValueHandlerObject> entryFunctionMap =
                new Dictionary<string, ValueHandlerObject>(StringComparer.Ordinal);

        [NonSerialized]
        public Dictionary<string, FlowHandler> exitActionMap =
                new Dictionary<string, FlowHandler>(StringComparer.Ordinal);

        [NonSerialized]
        public Dictionary<string, ValueHandlerObject> exitFunctionMap =
                new Dictionary<string, ValueHandlerObject>(StringComparer.Ordinal);

        ///<summary>Macros dont use blackboard overrides or blackboard variables parametrization</summary>
        public override bool allowBlackboardOverrides => false;

        ///<summary>The entry node of the Macro (input ports)</summary>
        public MacroInputNode entry {
            get {
                if (_entry == null) {
                    _entry = allNodes.OfType<MacroInputNode>().FirstOrDefault();
                    if (_entry == null)
                        _entry = AddNode<MacroInputNode>(new Vector2(-translation.x + 200,
                            -translation.y + 200));
                }
                return _entry;
            }
        }

        ///<summary>The exit node of the Macro (output ports)</summary>
        public MacroOutputNode exit {
            get {
                if (_exit == null) {
                    _exit = allNodes.OfType<MacroOutputNode>().FirstOrDefault();
                    if (_exit == null)
                        _exit = AddNode<MacroOutputNode>(new Vector2(-translation.x + 600,
                            -translation.y + 200));
                }
                return _exit;
            }
        }

        public override object OnDerivedDataSerialization()
        {
            var data = new DerivedSerializationData();
            data.inputDefinitions = inputDefinitions;
            data.outputDefinitions = outputDefinitions;
            return data;
        }

        public override void OnDerivedDataDeserialization(object data)
        {
            if (data is DerivedSerializationData) {
                inputDefinitions = ((DerivedSerializationData)data).inputDefinitions;
                outputDefinitions = ((DerivedSerializationData)data).outputDefinitions;
            }
        }

        ///<summary>validates the entry and exit references</summary>
        protected override void OnGraphValidate()
        {
            base.OnGraphValidate();
            _entry = null;
            _exit = null;
            _entry = entry;
            _exit = exit;
        }

        ///<summary>Adds a new input port definition to the Macro</summary>
        public Port AddInputDefinition(DynamicParameterDefinition def)
        {
            if (inputDefinitions.Find(d => d.ID == def.ID) == null) {
                inputDefinitions.Add(def);
                entry.GatherPorts();
                return entry.GetOutputPort(def.ID);
            }
            return null;
        }

        ///<summary>Adds a new output port definition to the Macro</summary>
        public Port AddOutputDefinition(DynamicParameterDefinition def)
        {
            if (outputDefinitions.Find(d => d.ID == def.ID) == null) {
                outputDefinitions.Add(def);
                exit.GatherPorts();
                return exit.GetInputPort(def.ID);
            }
            return null;
        }

        //create initial example ports in case there are none in both entry and exit
        public void AddExamplePorts()
        {
            if (inputDefinitions.Count == 0 && outputDefinitions.Count == 0) {
                var defIn = new DynamicParameterDefinition("In", typeof(Flow));
                var defOut = new DynamicParameterDefinition("Out", typeof(Flow));
                var source = AddInputDefinition(defIn);
                var target = AddOutputDefinition(defOut);
                BinderConnection.Create(source, target);
                Validate();
            }
        }

        /// ----------------------------------------------------------------------------------------------
        /// <summary>
        ///     Set a value input of type T of the Macro to a certain value. Only use to interface with
        ///     the Macro from code.
        /// </summary>
        public void SetValueInput<T>(string name, T value)
        {
            var def = inputDefinitions.FirstOrDefault(d => d.name == name && d.type == typeof(T));

            if (def == null) {
                Logger.LogError(string.Format(
                    "Input of name {0} and type {1}, does not exist within the list of Macro Inputs",
                    name, typeof(T)), LogTag.EXECUTION, entry);
                return;
            }
            entryFunctionMap[def.ID] = () => {
                return value;
            };
        }

        ///<summary> Call a Flow Input of the Macro. Only use to interface with the Macro from code.</summary>
        public void CallFlowInput(string name)
        {
            var def = inputDefinitions.FirstOrDefault(d =>
                    d.name == name && d.type == typeof(Flow));

            if (def == null) {
                Logger.LogError(string.Format(
                    "Input of name {0} and type Flow, does not exist within the list of Macro Inputs",
                    name), LogTag.EXECUTION, entry);
                return;
            }
            entryActionMap[def.ID](new Flow());
        }

        /// <summary>
        ///     Get the value output of type T of the Macro. Only use to interface with the Macro from
        ///     code.
        /// </summary>
        public T GetValueOutput<T>(string name)
        {
            var def = outputDefinitions.FirstOrDefault(d => d.name == name && d.type == typeof(T));

            if (def == null) {
                Logger.LogError(string.Format(
                    "Input of name {0} and type {1} do not exist within the list of Macro Outputs",
                    name, typeof(T)), LogTag.EXECUTION, exit);
                return default;
            }
            return (T)exitFunctionMap[def.ID]();
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Create/Macro Asset", false, 1)]
        public static void CreateMacro()
        {
            var macro = EditorUtils.CreateAsset<Macro>();
            macro.AddExamplePorts();
            Selection.activeObject = macro;
            UndoUtility.SetDirty(macro);
            AssetDatabase.SaveAssets();
        }
#endif
        ///----------------------------------------------------------------------------------------------
        [Serializable]
        private class DerivedSerializationData
        {
            public List<DynamicParameterDefinition> inputDefinitions;
            public List<DynamicParameterDefinition> outputDefinitions;
        }
        ///----------------------------------------------------------------------------------------------
    }
}
