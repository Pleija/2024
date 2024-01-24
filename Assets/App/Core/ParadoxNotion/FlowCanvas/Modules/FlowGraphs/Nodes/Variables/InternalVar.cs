#region
using System;
using System.Linq;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Set Internal Var"),
     Description(
         "Can be used to set an internal variable, to later be retrieved with a 'Get Internal Var' node. If you do not call 'Set', then the input value will work as a relay instead."),
     Category("Variables/Internal"), Color("866693"), ContextDefinedInputs(typeof(Wild)),
     ExposeAsDefinition]
    public abstract class RelayValueInputBase : FlowNode
    {
        public abstract Type relayType { get; }
    }

    ///<summary>Relay Input</summary>
    public class RelayValueInput<T> : RelayValueInputBase, IEditorMenuCallbackReceiver
    {
        [DelayedField, Tooltip("The identifier name of the internal var")]
        public string identifier = "MyInternalVarName";

        public ValueInput<T> port { get; private set; }
        public bool cached { get; private set; }
        public T cachedValue { get; private set; }
        public override Type relayType => typeof(T);
        public override string name => string.Format("@ {0}", identifier);
#if UNITY_EDITOR
        void IEditorMenuCallbackReceiver.OnMenu(GenericMenu menu, Vector2 pos, Port contextPort,
            object dropInstance)
        {
            if (contextPort == null || contextPort.type.IsAssignableFrom(relayType))
                menu.AddItem(
                    new GUIContent(string.Format("Variables/Internal/Get '{0}'", identifier)),
                    false, () => {
                        flowGraph.AddFlowNode<RelayValueOutput<T>>(pos, contextPort, dropInstance)
                                .SetSource(this);
                    });
        }
#endif

        protected override void RegisterPorts()
        {
            var fOut = AddFlowOutput(" ");
            AddFlowInput("Set", f => {
                cached = true;
                cachedValue = port.value;
                fOut.Call(f);
            });
            port = AddValueInput<T>("Value");
        }
    }

    ///----------------------------------------------------------------------------------------------
    [DoNotList,
     Description("Returns the selected and previously set Internal Variable's input value."),
     Color("866693"), ContextDefinedOutputs(typeof(Wild))]
    public abstract class RelayValueOutputBase : FlowNode
    {
        public abstract void SetSource(RelayValueInputBase source);
    }

    ///<summary>Relay Output</summary>
    public class RelayValueOutput<T> : RelayValueOutputBase
    {
        private WeakReference<RelayValueInputBase> _sourceInputRef;

        [SerializeField]
        private string _sourceInputUID;

        private string sourceInputUID {
            get => _sourceInputUID;
            set => _sourceInputUID = value;
        }

        private RelayValueInput<T> sourceInput {
            get {
                RelayValueInputBase reference;

                if (_sourceInputRef == null) {
                    reference = graph.GetAllNodesOfType<RelayValueInput<T>>()
                            .FirstOrDefault(i => i.UID == sourceInputUID);
                    _sourceInputRef = new WeakReference<RelayValueInputBase>(reference);
                }
                _sourceInputRef.TryGetTarget(out reference);
                return reference as RelayValueInput<T>;
            }
        }

        public override string name =>
                string.Format("{0}", sourceInput != null ? sourceInput.ToString() : "@ NONE");

        public override void SetSource(RelayValueInputBase source)
        {
            _sourceInputUID = source != null ? source.UID : null;
            _sourceInputRef = new WeakReference<RelayValueInputBase>(source);
            GatherPorts();
        }

        protected override void RegisterPorts()
        {
            AddValueOutput("Value", () => {
                if (sourceInput == null) return default;
                return sourceInput.cached ? sourceInput.cachedValue : sourceInput.port.value;
            });
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeExternalGUI()
        {
            if (sourceInput != null && (sourceInput.isSelected || isSelected)) {
                Handles.color = Color.grey;
                Handles.DrawAAPolyLine(rect.center, sourceInput.rect.center);
                Handles.color = Color.white;
            }
        }

        protected override void OnNodeInspectorGUI()
        {
            var relayInputs = graph.GetAllNodesOfType<RelayValueInputBase>();
            var newInput = EditorUtils.Popup("Internal Var Source", sourceInput, relayInputs);

            if (newInput != sourceInput) {
                if (newInput == null) {
                    SetSource(null);
                    return;
                }

                if (newInput.relayType == typeof(T)) {
                    SetSource(newInput);
                    return;
                }
                var newNode = (RelayValueOutputBase)ReplaceWith(
                    typeof(RelayValueOutput<>).MakeGenericType(newInput.relayType));
                newNode.SetSource(newInput);
            }
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
