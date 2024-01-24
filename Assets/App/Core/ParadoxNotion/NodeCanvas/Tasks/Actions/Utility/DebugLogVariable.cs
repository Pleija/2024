#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Utility"), Description("Logs the value of a variable in the console"),
     Obsolete("Use Debug Log Text")]
    public class DebugLogVariable : ActionTask
    {
        public CompactStatus finishStatus = CompactStatus.Success;

        [BlackboardOnly]
        public BBParameter<object> log;

        public BBParameter<string> prefix;
        public float secondsToRun = 1f;

        protected override string info => "Log '"
                + log
                + "'"
                + (secondsToRun > 0 ? " for " + secondsToRun + " sec." : "");

        protected override void OnExecute()
        {
            Logger.Log(string.Format("<b>({0}) ({1}) | Var '{2}' = </b> {3}", agent.gameObject.name,
                prefix.value,
                log.name, log.value), LogTag.EXECUTION, this);
        }

        protected override void OnUpdate()
        {
            if (elapsedTime >= secondsToRun)
                EndAction(finishStatus == CompactStatus.Success ? true : false);
        }
    }
}
