#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"), Description("Set a blackboard boolean variable")]
    public class SetBoolean : ActionTask
    {
        public enum BoolSetModes { False = 0, True = 1, Toggle = 2 }

        [RequiredField, BlackboardOnly]
        public BBParameter<bool> boolVariable;

        public BoolSetModes setTo = BoolSetModes.True;

        protected override string info {
            get {
                if (setTo == BoolSetModes.Toggle) return "Toggle " + boolVariable;
                return "Set " + boolVariable + " to " + setTo;
            }
        }

        protected override void OnExecute()
        {
            if (setTo == BoolSetModes.Toggle) {
                boolVariable.value = !boolVariable.value;
            }
            else {
                var checkBool = (int)setTo == 1;
                boolVariable.value = checkBool;
            }
            EndAction();
        }
    }
}
