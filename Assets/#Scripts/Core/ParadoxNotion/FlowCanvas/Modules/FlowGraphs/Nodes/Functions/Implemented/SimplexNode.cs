using System;
using System.Collections;
using System.Reflection;
using ParadoxNotion;
using ParadoxNotion.Design;

namespace FlowCanvas.Nodes
{
    /// <summary>
    ///     SimplexNodes are used within a SimplexNodeWrapper node. Derive CallableActionNode, CallableFunctionNode,
    ///     LatentActionNode, PureFunctionNode or ExtractorNode, for creating simple nodes easily and type cast safe.
    /// </summary>
    [SpoofAOT]
    public abstract class SimplexNode
    {
        [NonSerialized]
        private string _name;

        [NonSerialized]
        private string _description;

        ///<summary>A reference to the parent node this SimplexNode lives within</summary>
        protected FlowNode parentNode { get; private set; }

        public virtual string name {
            get {
                if (string.IsNullOrEmpty(_name)) {
                    var nameAtt = GetType().RTGetAttribute<NameAttribute>(false);
                    _name = nameAtt != null ? nameAtt.name : GetType().FriendlyName().SplitCamelCase();
                }
                return _name;
            }
        }

        public virtual string description {
            get {
                if (string.IsNullOrEmpty(_description)) {
                    var descAtt = GetType().RTGetAttribute<DescriptionAttribute>(false);
                    _description = descAtt != null ? descAtt.description : "No Description";
                }
                return _description;
            }
        }

        private ParameterInfo[] _parameters;

        public ParameterInfo[] parameters {
            get {
                if (_parameters != null) return _parameters;
                var invokeMethod = GetType().GetMethod("Invoke"
                    , BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);
                return _parameters = invokeMethod != null ? invokeMethod.GetParameters() : new ParameterInfo[0];
            }
        }

        public void RegisterPorts(FlowNode node)
        {
            parentNode = node;
            OnRegisterPorts(node);

            //output ports are done through public properties for all simplex nodes
            var type = GetType();
            var props = type.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);

            for (var i = 0; i < props.Length; i++) {
                var prop = props[i];
                if (prop.CanRead && !prop.GetGetMethod().IsVirtual) node.TryAddPropertyValueOutput(prop, this);
            }
            OnRegisterExtraPorts(node);
        }

        //set default parameter values if any
        public void SetDefaultParameters(FlowNode node)
        {
            if (parameters == null) return;

            for (var i = 0; i < parameters.Length; i++) {
                var parameter = parameters[i];

                if (parameter.IsOptional && parameter.DefaultValue != null) {
                    var inPort = node.GetInputPort(parameter.Name) as ValueInput;
                    if (inPort != null) inPort.serializedValue = parameter.DefaultValue;
                    // if ( inPort != null ) { inPort.SetDefaultAndSerializedValue(parameter.DefaultValue); }
                }
            }
        }

        ///-------------------------------------------------------------------------
        protected abstract void OnRegisterPorts(FlowNode node);

        protected virtual void OnRegisterExtraPorts(FlowNode node) { }
        public virtual void OnGraphStarted() { }
        public virtual void OnGraphPaused() { }
        public virtual void OnGraphUnpaused() { }
        public virtual void OnGraphStoped() { }
    }
}
