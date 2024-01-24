#region
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [ExposeAsDefinition, Category("Flow Controllers/Selectors"),
     Description(
         "Select a Result value out of the two input cases provided, based on a boolean Condition")]
    public class SelectOnBool<T> : FlowControlNode
    {
        private ValueInput<bool> condition;
        private ValueInput<T> isFalse;
        private ValueInput<T> isTrue;
        private ValueOutput<T> result;

        protected override void RegisterPorts()
        {
            condition = AddValueInput<bool>("Condition");
            isTrue = AddValueInput<T>("Is True", "True");
            isFalse = AddValueInput<T>("Is False", "False");
            result = AddValueOutput("Result", "Value", () => {
                return condition.value ? isTrue.value : isFalse.value;
            });
        }
    }
}
