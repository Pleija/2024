#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("On Update", 7), Category("Events/Graph"),
     Description(
         "Called per-frame.\nUpdate Interval optionally determines the period in seconds every which update is called. Leave at 0 to call update per-frame as normal."),
     ExecutionPriority(7)]
    public class UpdateEvent : EventNode, IUpdatable
    {
        private float lastUpdatedTime;
        private FlowOutput update;
        public BBParameter<float> updateInterval = 0f;

        public void Update()
        {
            if (updateInterval.value <= 0) {
                update.Call(new Flow());
                return;
            }
            var currentTime = graph.elapsedTime;

            if (currentTime > updateInterval.value + lastUpdatedTime) {
                update.Call(new Flow());
                lastUpdatedTime = currentTime;
            }
        }

        protected override void RegisterPorts()
        {
            update = AddFlowOutput("Out");
        }

        public override void OnGraphStarted()
        {
            lastUpdatedTime = -1;
        }
    }
}
