#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"),
     Description("Saves the blackboard variables in the provided key and to be loaded later on")]
    public class SaveBlackboard : ActionTask<Blackboard>
    {
        [RequiredField]
        public BBParameter<string> saveKey;

        protected override string info => string.Format("Save Blackboard [{0}]", saveKey);

        protected override void OnExecute()
        {
            agent.Save(saveKey.value);
            EndAction();
        }
    }
}
