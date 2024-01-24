#region
using System.Collections;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Category("Flow Controllers/Filters"),
     Description("Filters the flow execution so that it can't be called very frequently"),
     ContextDefinedInputs(typeof(float)), ContextDefinedOutputs(typeof(float))]
    public class Cooldown : FlowControlNode
    {
        private Coroutine coroutine;
        private FlowOutput finish;
        private float remaining;
        private float remainingNormalized;
        private FlowOutput start;
        private ValueInput<float> time;
        private FlowOutput update;

        public override string name =>
                base.name + string.Format(" [{0}]", remaining.ToString("0.0"));

        public override void OnGraphStarted()
        {
            remaining = 0;
            remainingNormalized = 0;
            coroutine = null;
        }

        public override void OnGraphStoped()
        {
            if (coroutine != null) {
                StopCoroutine(coroutine);
                coroutine = null;
                remaining = 0;
                remainingNormalized = 0;
            }
        }

        protected override void RegisterPorts()
        {
            start = AddFlowOutput("Start", "Out");
            update = AddFlowOutput("Update");
            finish = AddFlowOutput("Finish", "Ready");
            time = AddValueInput<float>("Time").SetDefaultAndSerializedValue(1);
            AddValueOutput("Time Left", "Current", () => {
                return Mathf.Max(remaining, 0);
            });
            AddValueOutput("Normalized", () => {
                return Mathf.Clamp01(remainingNormalized);
            });
            AddFlowInput("In", Begin);
            AddFlowInput("Cancel", Cancel);
        }

        private void Begin(Flow f)
        {
            if (remaining <= 0 && coroutine == null) coroutine = StartCoroutine(CountDown(f));
        }

        private void Cancel(Flow f)
        {
            if (coroutine != null) {
                StopCoroutine(coroutine);
                coroutine = null;
                remaining = 0;
                remainingNormalized = 0;
            }
        }

        private IEnumerator CountDown(Flow f)
        {
            SetStatus(Status.Running);
            var total = time.value;
            remaining = total;
            start.Call(f);

            while (remaining > 0) {
                while (!graph.didUpdateLastFrame) yield return null;
                remaining = total - elapsedTime;
                remainingNormalized = remaining / total;
                update.Call(f);
                yield return null;
            }
            coroutine = null;
            finish.Call(f);
            SetStatus(Status.Resting);
        }
    }
}
