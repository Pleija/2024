#region
using FlowCanvas;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.DialogueTrees
{
    [Name("Sub FlowScript"),
     Description(
         "Executes a FlowScript. Use the Finish flowscript node to continue the dialogue either in Success or Failure.\nThe actor selected here will also be used in the flowcript for 'Self'."),
     DropReferenceType(typeof(FlowScript)), Icon("FS")]
    public class DTNestedFlowScript : DTNodeNested<FlowScript>, IUpdatable
    {
        [SerializeField, ExposeField]
        private BBParameter<FlowScript> _flowScript = null;

        public override int maxOutConnections => 2;

        public override FlowScript subGraph {
            get => _flowScript.value;
            set => _flowScript.value = value;
        }

        public override BBParameter subGraphParameter => _flowScript;

        void IUpdatable.Update()
        {
            if (currentInstance != null && status == Status.Running)
                currentInstance.UpdateGraph(graph.deltaTime);
        }

        protected override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (subGraph == null) return Error("FlowScript is null");
            status = Status.Running;
            this.TryStartSubGraph(finalActor.transform, OnFlowScriptFinish);
            return status;
        }

        private void OnFlowScriptFinish(bool success)
        {
            status = success ? Status.Success : Status.Failure;
            DLGTree.Continue(success ? 0 : 1);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        public override string GetConnectionInfo(int i)
        {
            return i == 0 ? "Success" : "Failure";
        }
#endif
    }
}
