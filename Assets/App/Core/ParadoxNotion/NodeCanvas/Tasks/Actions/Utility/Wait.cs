#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Utility")]
    public class Wait : ActionTask
    {
        public CompactStatus finishStatus = CompactStatus.Success;
        public BBParameter<float> waitTime = 1f;
        protected override string info => string.Format("Wait {0} sec.", waitTime);

        protected override void OnUpdate()
        {
            if (elapsedTime >= waitTime.value)
                EndAction(finishStatus == CompactStatus.Success ? true : false);
        }
    }
}
