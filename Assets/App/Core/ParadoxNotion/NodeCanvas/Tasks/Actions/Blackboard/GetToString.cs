#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Get Variable To String"), Category("✫ Blackboard")]
    public class GetToString : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<string> toString;

        [BlackboardOnly]
        public BBParameter<object> variable;

        protected override string info => string.Format("{0} = {1}.ToString()", toString, variable);

        protected override void OnExecute()
        {
            toString.value = !variable.isNull ? variable.value.ToString() : "NULL";
            EndAction();
        }
    }
}
