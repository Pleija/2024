#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Utility"),
     Description(
         "Will return true after a specific amount of time has passed and false while still counting down")]
    public class Timeout : ConditionTask
    {
        private float startTime;
        public BBParameter<float> timeout = 1f;
        private float elapsedTime => ownerSystem.elapsedTime - startTime;

        protected override string info => string.Format(
            "Timeout {0}/{1}", elapsedTime.ToString("0.00"), timeout);

        protected override void OnEnable()
        {
            startTime = ownerSystem.elapsedTime;
        }

        protected override bool OnCheck() => elapsedTime >= timeout.value;
    }
}
