﻿#region
using System.Collections;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Control Graph Owner"), Category("✫ Utility"),
     Description("Start, Resume, Pause, Stop a GraphOwner's behaviour")]
    public class GraphOwnerControl : ActionTask<GraphOwner>
    {
        public enum Control { StartBehaviour, StopBehaviour, PauseBehaviour }
        public Control control = Control.StartBehaviour;
        public bool waitActionFinish = true;
        protected override string info => agentInfo + "." + control;

        protected override void OnExecute()
        {
            if (control == Control.StartBehaviour) {
                if (waitActionFinish) {
                    agent.StartBehaviour(s => {
                        EndAction(s);
                    });
                }
                else {
                    agent.StartBehaviour();
                    EndAction();
                }
                return;
            }

            //in case target is this owner, we must yield 1 frame before pausing/stoppping
            if (agent == ownerSystemAgent)
                StartCoroutine(YieldDo());
            else
                Do();
        }

        private IEnumerator YieldDo()
        {
            yield return null;
            Do();
        }

        private void Do()
        {
            if (control == Control.StopBehaviour) {
                EndAction(null);
                agent.StopBehaviour();
            }

            if (control == Control.PauseBehaviour) {
                EndAction(null);
                agent.PauseBehaviour();
            }
        }

        protected override void OnStop()
        {
            if (waitActionFinish && control == Control.StartBehaviour) agent.StopBehaviour();
        }
    }
}
