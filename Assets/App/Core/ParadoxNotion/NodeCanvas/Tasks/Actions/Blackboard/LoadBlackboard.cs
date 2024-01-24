#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"),
     Description(
         "Loads the blackboard variables previously saved in the provided PlayerPrefs key if at all. Returns false if no saves found or load was failed")]
    public class LoadBlackboard : ActionTask<Blackboard>
    {
        [RequiredField]
        public BBParameter<string> saveKey;

        protected override string info => string.Format("Load Blackboard [{0}]", saveKey);

        protected override void OnExecute()
        {
            EndAction(agent.Load(saveKey.value));
        }
    }
}
