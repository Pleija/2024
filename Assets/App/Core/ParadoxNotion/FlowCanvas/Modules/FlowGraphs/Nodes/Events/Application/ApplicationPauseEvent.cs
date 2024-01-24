#region
using ParadoxNotion.Design;
using ParadoxNotion.Services;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("On Application Pause"), Category("Events/Application"),
     Description("Called when the Application is paused or resumed")]
    public class ApplicationPauseEvent : EventNode
    {
        private bool isPause;
        private FlowOutput pause;

        public override void OnGraphStarted()
        {
            MonoManager.current.onApplicationPause += ApplicationPause;
        }

        public override void OnGraphStoped()
        {
            MonoManager.current.onApplicationPause -= ApplicationPause;
        }

        private void ApplicationPause(bool isPause)
        {
            this.isPause = isPause;
            pause.Call(new Flow());
        }

        protected override void RegisterPorts()
        {
            pause = AddFlowOutput("Out");
            AddValueOutput("Is Pause", () => {
                return isPause;
            });
        }
    }
}
