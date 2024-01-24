#region
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("On Variable Change"), Category("Events/Other"),
     Description("Called when the target variable change. (Not whenever it is set).")]
    public class VariableChangedEvent : EventNode
    {
        private FlowOutput fOut;
        private object newValue;

        [BlackboardOnly]
        public BBObjectParameter targetVariable;

        public override string name => string.Format("{0} [{1}]", base.name, targetVariable);

        public override void OnGraphStarted()
        {
            if (targetVariable.varRef != null) {
                targetVariable.varRef.onValueChanged -= OnValueChanged;
                targetVariable.varRef.onValueChanged += OnValueChanged;
            }
        }

        public override void OnGraphStoped()
        {
            if (targetVariable.varRef != null)
                targetVariable.varRef.onValueChanged -= OnValueChanged;
            newValue = null;
        }

        protected override void RegisterPorts()
        {
#if UNITY_EDITOR
            if (!Threader.applicationIsPlaying) {
                targetVariable.onVariableReferenceChanged -= OnVariableRefChange;
                targetVariable.onVariableReferenceChanged += OnVariableRefChange;
            }
#endif
            fOut = AddFlowOutput("Out");
            AddValueOutput("Value", targetVariable.varType, () => {
                return newValue;
            });
        }

        private void OnValueChanged(object value)
        {
            newValue = value;
            fOut.Call(new Flow());
        }

        private void OnVariableRefChange(Variable newVarRef)
        {
            if (newVarRef != null) {
                targetVariable.SetType(newVarRef.varType);
                GatherPorts();
            }
        }
    }
}
