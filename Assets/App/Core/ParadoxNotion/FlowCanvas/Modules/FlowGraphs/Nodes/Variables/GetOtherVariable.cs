#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Get Other Of Type"), Category("Variables/Blackboard"),
     Description(
         "Use this to get a variable value from blackboards other than the one this flowscript is using"),
     ContextDefinedOutputs(typeof(Wild)), ContextDefinedInputs(typeof(IBlackboard))]
    public class GetOtherVariable<T> : FlowNode
    {
        public override string name => "Get Variable";

        protected override void RegisterPorts()
        {
            var bb = AddValueInput<IBlackboard>("Blackboard");
            var varName = AddValueInput<string>("Variable");
            AddValueOutput("Value", () => {
                return bb.value.GetVariableValue<T>(varName.value);
            });
        }
    }
}
