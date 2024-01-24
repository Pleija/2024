#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class StringContains : ConditionTask
    {
        public BBParameter<string> checkString;

        [RequiredField, BlackboardOnly]
        public BBParameter<string> targetString;

        protected override string info =>
                string.Format("{0} Contains {1}", targetString, checkString);

        protected override bool OnCheck() => targetString.value.Contains(checkString.value);
    }
}
