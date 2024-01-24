#region
using NodeCanvas.BehaviourTrees;
using NodeCanvas.DialogueTrees;
using NodeCanvas.Framework;
using NodeCanvas.StateMachines;
using ParadoxNotion.Design;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Sub Tree"), DropReferenceType(typeof(BehaviourTree)), Icon("BT")]
    public class FlowNestedBT : FlowNestedBase<BehaviourTree>
    {
        protected override void RegisterPorts()
        {
            base.RegisterPorts();
            AddValueOutput("Status", () => currentInstance.rootStatus);
        }
    }

    [Name("Sub FSM"), DropReferenceType(typeof(FSM)), Icon("FSM")]
    public class FlowNestedFSM : FlowNestedBase<FSM>
    {
        protected override void RegisterPorts()
        {
            base.RegisterPorts();
            AddValueOutput<IState>("State", () => currentInstance.currentState);
        }
    }

    [Name("Sub Dialogue"), DropReferenceType(typeof(DialogueTree)), Icon("Dialogue")]
    public class FlowNestedDT : FlowNestedBase<DialogueTree>
    {
        protected override void RegisterPorts()
        {
            base.RegisterPorts();
            AddValueOutput("Actor", () => currentInstance.currentNode?.finalActor);
        }
    }
}
